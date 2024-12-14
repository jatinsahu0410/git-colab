import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const imgekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY as string,
    privateKey: process.env.PRIVATE_KEY as string,
    urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT as string
});

export async function DELETE(req: NextRequest) {
    try {
        const fileId = await req.json();
        console.log("The data is : ", fileId);

        if (!fileId) {
            return NextResponse.json({ message: "File id not found" }, { status: 404 });
        }
        // delete file from image kit io 
        return new Promise((res) => {
            imgekit.deleteFile(fileId, (error, result) => {
                if (error) {
                    res(NextResponse.json({ error: error.message }, { status: 500 }));
                } else {
                    res(NextResponse.json({ success: true, result }, { status: 200 }));
                }
            })
        })
    } catch (error) {
        console.log("The error in delete from imagekit io ", error);
        return NextResponse.json({ message: "Internal Sever error" }, { status: 500 });
    }
}