import {
    GoogleGenerativeAI,
} from "@google/generative-ai"
import { Document } from "@langchain/core/documents";

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.GEMINI_API_KEY as string

const genAi = new GoogleGenerativeAI(API_KEY!);
const model = genAi.getGenerativeModel({
    model: MODEL_NAME,
});

export const genSummariesCommit = async (diff: string) => {
    // console.log("The gemini api invoked : ", diff.slice(0, 50));
    // githubUrl/commit/commitsHashes.diff
    const res = await model.generateContent([
        `You are an  expert Programmer, and you are trying to summaries a git diff.
        Reminders about the git diff format:
        For every file, there are few metadata lines, like (for example):
        \'\'\'
        diff --git a/lib/index.js b/lib/index.js
        index aaf001..bef003 1006063
        ---a/lib/index.js
        +++b/lib/index.js
        \'\'\'
        This means that \'lib/index.js\' was modified in the commit. Note that this is the only an example.
        Then there is a specifier of the lines that were modified.
        A line starting with \\ means it was added.
        A line that starting with - means that line was deleted.
        A line that starts with neither \+\ nor - is code given for context and better understanding.
        It is not part of the diff.
        [...]
        EXAMPLE SUMMARY COMMENTS:
        \'\'\'
        *Raised the amount of returned recordings from \'10\'to \'100\' [packages/server/recordings_opi.ts], [packages/server/constants.ts]
        *Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
        *Moved the l'octokit initialization to a separote file [src/actokit.ts], [src/index.ts]
        *Added an OpenAI API for completions (packages/utils/apis/openai.ts)
        *Lowered numeric tolerance for test files
        \'\'\'
        Most commits will have less comments than this examples list.
        The last comment does not include the file names.
        because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary.
        It is given only as an example of appropriate comments...
            Please summarise the following diff file: \n\n${diff}, `
    ]);

    // const res = await model.generateContent('HI');
    console.log("The gemini response : ", res.response);
    return res.response;
}

// genSummariesCommit('no');

// summaries the code from the github 
export const summariesCode = async (doc : Document) => {
    console.log("getting the summary for : ", doc.metadata.source);
    const code = doc.pageContent.slice(0, 10000); // limit to 10,000 char
    const res = await model.generateContent([
        `You are an intelligent after software engineer who specialises in onboarding junior software engineers onto projects,
        You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file.
        Here is the code:
        ----
        ${code}
        ----

        Give a summary not more than 100 words of the above code.
        `
    ]);
    return res.response.candidates ? res.response.candidates[0]?.content.parts[0]?.text : "";
}

// for generating the embeddings 
export async function generateEmbeddings(summary: string){
    const model = genAi.getGenerativeModel({
        model: "text-embedding-004"
    });

    const res = await model.embedContent(summary);
    const embedding = res.embedding;
    // console.log("The vector is : ", embedding.values);
    return embedding.values;
}

