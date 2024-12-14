import { AssemblyAI } from "assemblyai"

const API_KEY = process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY as string;

const client = new AssemblyAI({
    apiKey: API_KEY!,
});

function msToTime(ms: number){
    const second = ms / 1000
    const minutes = Math.floor(second/ 60)
    const remainingSecond = Math.floor(second % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSecond.toString().padStart(2, '0')}`;
}

// now the main function that 
export const processMeeting = async (meetingUrl: string) => {
    const transcript = await client.transcripts.transcribe({
        audio: meetingUrl,
        auto_chapters: true,
    })

    const summaries = transcript.chapters?.map(chapter => ({
        start : msToTime(chapter.start),
        end: msToTime(chapter.end),
        summary: chapter.summary,
        gist: chapter.gist,
        headline: chapter.headline,
    })) || [];
    if(!transcript.text) throw new Error("No transcript found");
    return {
        summaries
    }
}

