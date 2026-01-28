import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // e.g., https://pub-xxxxxxxx.r2.dev

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID || '',
        secretAccessKey: R2_SECRET_ACCESS_KEY || '',
    },
});

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create a unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9.\-_]/g, '');
        const filename = `${timestamp}-${originalName}`;

        // Upload to R2
        await S3.send(new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: filename,
            Body: buffer,
            ContentType: file.type,
        }));

        // Return the public URL
        // If R2_PUBLIC_URL is not set, we might need to fallback or error, but assuming it is set for now.
        // It should differ based on whether it's a custom domain or the R2 dev subdomain.
        const publicUrl = R2_PUBLIC_URL
            ? `${R2_PUBLIC_URL}/${filename}`
            : `https://${R2_BUCKET_NAME}.${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${filename}`; // Fallback (often doesn't work publicly without config)

        return NextResponse.json({ url: publicUrl }, { status: 200 });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Error uploading file' }, { status: 500 });
    }
}
