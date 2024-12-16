// basically this function is use to fetch the faults in th github url by taking guithub url as input
import { GithubRepoLoader } from "@langchain/community/document_loaders/web/github";
import { Document } from "@langchain/core/documents";
import { doc } from "prettier";
import { generateEmbeddings, summariesCode } from "./gemini";
import { db } from "@/server/db";
import { Octokit } from "octokit";

const getFileCount = async (
    path: string,
    octokit: Octokit,
    githubOwner: string,
    githubRepo: string,
    acc: number = 0
) => {
    const { data } = await octokit.rest.repos.getContent({
        owner: githubOwner,
        repo: githubRepo,
        path
    });

    if (!Array.isArray(data) && data.type === 'file') {
        return acc + 1;
    }

    if (Array.isArray(data)) {
        let fileCount: number = 0;
        const directories: string[] = [];

        for (const item of data) {
            if (item.type === 'dir') {
                directories.push(item.path);
            } else {
                fileCount++;
            }
        }

        if (directories.length > 0) {
            // Fix: Ensure getFileCount is returned properly
            const directoryCount = await Promise.all(
                directories.map(dirPath =>
                    getFileCount(dirPath, octokit, githubOwner, githubRepo, 0)
                )
            );

            // Fix: Ensure reduce processes an array of numbers
            fileCount += directoryCount.reduce((acc, count) => acc + count, 0);
        }

        return acc + fileCount;
    }

    return acc;
};

export const checkCredits = async (githubUrl: string, githubToken?: string) => {
    // as basically 1 credit is need to serve 1 file so we need to find how many file are int a github repo 
    const octokit = new Octokit({ auth: githubToken })
    const githubOwner = githubUrl.split('/')[3];
    const githubRepo = githubUrl.split('/')[4];
    if (!githubOwner || !githubRepo) return 0;

    const fileCount = await getFileCount('', octokit, githubOwner, githubRepo, 0);
    return fileCount;
}

export const loadGithubRepo = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['packages-lock.json', 'yarn-lock', 'pnpm-lock.yaml', 'bun-lockb'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    });

    const docs = await loader.load();
    return docs;
};

// console.log(await loadGithubRepo('https://github.com/jatinsahu0410/skilify_intern_assignment'))

// generate the embeddings 
export const genEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async doc => {
        const summary = await summariesCode(doc);
        const embedding = await generateEmbeddings(summary!)
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source
        }
    }))
}
export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepo(githubUrl, githubToken);
    const allEmbeddings = await genEmbeddings(docs);
    console.log("Print all the embeddings : ", allEmbeddings);
    await Promise.allSettled(allEmbeddings.map(
        async (embedding, index) => {
            console.log(`Processing index ${index} of ${allEmbeddings.length}`)
            if (!embedding) return;
            // insert into the db 
            const sourceEmbeddings = await db.sourcecodeEmbedd.create({
                data: {
                    summary: embedding.summary!,
                    sourceCode: embedding.sourceCode,
                    fileName: embedding.fileName,
                    projectId,
                }
            });
            // well as the prisma don't allow push the vector directly so we have to use raw SQL quert to insert the embeddings 
            await db.$executeRaw`
            UPDATE "sourcecodeEmbedd"
            SET "summaryEmbedded" = ${embedding.embedding}::vector
            WHERE "id" = ${sourceEmbeddings.id}
            `
        }
    ))
}