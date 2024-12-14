import { NextRequest, NextResponse } from 'next/server';
import ImageKit from 'imagekit';

const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_PUBLIC_KEY!,
    privateKey: process.env.PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json(); // Parse incoming JSON request body
        const { filePath } = body;

        if (!filePath) {
            return NextResponse.json({ error: 'Missing filePath parameter' }, { status: 400 });
        }

        // Generate a signed URL for the given filePath
        const signedUrl = imagekit.url({
            path: filePath,
            signed: true,
            expireSeconds: 3600*5, // URL valid for 1 hour
        });

        return NextResponse.json({ signedUrl });
    } catch (error) {
        console.error('Error generating signed URL:', error);
        return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
    }
}
