import { processMeeting } from "@/lib/assembly";
import { db } from "@/server/db";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const bodyParser = z.object({
    meetingUrl: z.string(),
    meetingId: z.string()
});
 
export const maxDuration = 60;

export async function POST(req: NextRequest) {
    const user = currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { meetingUrl, meetingId } = bodyParser.parse(body);
        const { summaries } = await processMeeting(meetingUrl);
        await db.issue.createMany({
            data: summaries.map((sum) => (
                {
                    start: sum.start,
                    end: sum.end,
                    headline: sum.headline,
                    gist: sum.gist,
                    summary: sum.summary,
                    meetingId: meetingId,
                }
            ))
        });

        await db.meeting.update({
            where: {
                id: meetingId,
            },
            data:{
                status: "COMPLETE",
                name: summaries[0]!.headline
            }
        })
        return NextResponse.json({message: "Successfull", status: 200});
    } catch (error) {
        console.log("The error in process Meeting : ", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}