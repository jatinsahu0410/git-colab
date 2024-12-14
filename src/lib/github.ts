import { db } from "@/server/db";
import { Octokit } from "octokit";
import axios from "axios";
import { genSummariesCommit } from "./gemini";

export const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

// the github response type
type Response = {
    commitMessage: string,
    commitHash: string,
    commitAuthorName: string,
    commitAuthorAvatar: string,
    commitDate: string
}

export const getCommitHashes = async (githubUrl: string): Promise<Response[]> => {
    const [owner, repo] = githubUrl.split('/').slice(-2);
    if (!owner || !repo) {
        throw new Error("Repo or owner not found");
    }
    const { data } = await octokit.rest.repos.listCommits({
        owner,
        repo,
    });
    console.log(data);
    const sortedCommits = data.sort((a: any, b: any) => new Date(b.commit.author.date).getTime() - new Date(a.commit.author.date).getTime());

    return sortedCommits.slice(0, 10).map((commit: any) => ({
        commitHash: commit.sha as string,
        commitMessage: commit.commit.message ?? "",
        commitAuthorName: commit.commit?.author?.name ?? "",
        commitAuthorAvatar: commit?.author?.avatar_url ?? "",
        commitDate: commit.commit?.author?.date ?? ""
    }))
}

// console.log(await getCommitHashes(githubUrl))

// fetch the project and the git hub url 
export async function fetchProjectGitUrl(projectId: string) {
    const project = await db.project.findUnique({
        where: {
            id: projectId,
        },
        select: {
            githubUrl: true,
        }
    });
    if (!project?.githubUrl) {
        throw new Error("Project doesn't have github url")
    }
    return { project, githubUrl: project?.githubUrl };
}

// well for each commit we will be generating the summary for it is not feasible or good to generate the summary each time so we will be store the data in db and also checking if the commit is already present in the database

export const filterUnprocessedCommit = async (projectId: string, commitHashes: Response[]) => {
    const processedCommits = await db.commit.findMany({
        where: {
            projectId
        }
    });
    const unprocessCommits = commitHashes.filter((commit) => !processedCommits.some((processedCommits) => processedCommits.commitHash === commit.commitHash));
    // return the commits that aren't present in the database
    return unprocessCommits;
}

export const summariesCommits = async (githubUrl: string, commitHash: string) => {
    const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
        headers: {
            Accept: 'application/vnd.github.v3.diff'
        }
    });
    // console.log("The diff data is : ", data);
    // now send it to gemini to summaries the commit 
    const genResult = await genSummariesCommit(data);
    console.log("The genimi Reply is : ", genResult?.candidates ? genResult?.candidates[0]?.content.parts[0]?.text : " ");
    return genResult?.candidates ? genResult?.candidates[0]?.content.parts[0]?.text : " ";
};

export const pollCommits = async (projectId: string) => {
    const { project, githubUrl } = await fetchProjectGitUrl(projectId);
    const commitHashes = await getCommitHashes(githubUrl);
    const unprocessCommit = await filterUnprocessedCommit(projectId, commitHashes);
    const summaryResponses = await Promise.allSettled(unprocessCommit.map(commit => {
        return summariesCommits(githubUrl, commit.commitHash);
    }));

    const summaries = summaryResponses.map((response) => {
        if (response.status === 'fulfilled') {
            return response.value as unknown as string;
        }
        return "";
    });

    // now the last work is to save the summaries into the database 
    const commit = await db.commit.createMany({
        data: summaries.map((summary, index) => {
            // console.log("Processing this commit :", index);
            // console.log("The summary is : ")
            return {
                projectId: projectId,
                commitHash: unprocessCommit[index]?.commitHash,
                commitMessage: unprocessCommit[index]?.commitMessage,
                commitAuthorName: unprocessCommit[index]?.commitAuthorName,
                commitAuthorAvatar: unprocessCommit[index]?.commitAuthorAvatar,
                commitDate: unprocessCommit[index]?.commitDate,
                summary:summary,
            }
        },
    )
    });
    return commit;
};


// the unprocessed commits are : 
// console.log("The unprocessed Commits are :", await pollCommits('cm4b900q0000025p29fif25o7'))
// now up till we have got all the commits that are not stored in the database means need to summaries that 