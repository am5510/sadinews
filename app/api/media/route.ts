import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const media = await prisma.media.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(media);
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const media = await prisma.media.create({
            data: {
                title: body.title,
                category: body.category || 'image',
                sourceType: body.sourceType || 'upload',
                url: body.url,
                embedCode: body.embedCode,
            },
        });
        return NextResponse.json(media, { status: 201 });
    } catch (error) {
        console.error('Error creating media:', error);
        return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
    }
}
