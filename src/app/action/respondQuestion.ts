"use server"
import { streamText } from "ai"
import { createStreamableValue } from "ai/rsc"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { generateEmbeddings } from "@/lib/gemini";
import { db } from "@/server/db";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export async function askQuestion(question: string, projectId: string) {
    const stream = createStreamableValue();
    // the first works is to convert the question into vector embedding 
    const queryVector = await generateEmbeddings(question);
    const vectorQuery = `[${queryVector.join(',')}]`;

    // fetch all the page embeddings 
    const result = await db.$queryRaw`
    SELECT "fileName", "sourceCode", "summary",
    1 - ("summaryEmbedded" <=> ${vectorQuery}::vector) AS similarity
    FROM "sourcecodeEmbedd"
    WHERE 1 - ("summaryEmbedded" <=> ${vectorQuery}::vector) > .5
    AND "projectId" = ${projectId}
    ORDER BY similarity DESC
    LIMIT 10
    ` as { fileName: string, sourceCode: string, summary: string }[];

    // Creating the conetext then we can pass it to the gemini
    let context = '';

    for (const doc of result) {
        context += `source ${doc.fileName}\n code content: ${doc.sourceCode}\n Summary of File: ${doc.summary}\n\n`;
    }

    // Construct the prompt 
    (async () => {
        const { textStream } = streamText({
            model: google('gemini-1.5-flash'),
            prompt: `
            You are a ai code assistant who answers questions about the codebase. Your target audience is a technical intern who is looking to understand the codebase.

            AI assistant is a brand new, powerful, human-like artificial intelligence. The traits of AI include expert knowledge, helpfulness, cleverness, and articulateness.
            
            AI is a well-behaved and well-mannered individual.
            
            AI is always friendly, kind, and inspiring, and he is eager to provide vivid and thoughtful responses to the user.

            AI has the sum of all knowledge in their brain, and is able to accurately answer nearly any question about any topic in conversation.

            If the question is asking about code or a specific file, Al will provide the detailed answer, giving step by step instructions, including code snippets.
            START CONTEXT BLOCK
            ${context}
            END CONTEXT BLOCK

            START QUESTION
            ${question}
            ENDD QUESTION

            Ai assistant qill take account any CONTEXT-BLOCK that is provided in a conversation.
            If the context does not provide the answer to question, the ai assistant will say, I'm  sorry, but I don't know the answer.
            Ai assistant will not apologize for previous responses, but instead will indicated new information was gained.
            Ai assistant will not invent anything that is not drawn directly from contex.
            Answer in markdown syntax, with code snippets if needed. Be as detailed as possible when possible when answering, make sure there 
            `
        });

        for await (const chunk of textStream){
            stream.update(chunk);
        }

        stream.done();
    })();
    // invoked the function instantly
    return {
        output: stream.value,
        fileRefrences: result
    }
}