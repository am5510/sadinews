import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const media = await prisma.media.findUnique({ where: { id } });
        if (!media) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const media = await prisma.media.update({
            where: { id },
            data: {
                title: body.title,
                category: body.category,
                sourceType: body.sourceType,
                url: body.url,
                embedCode: body.embedCode,
                description: body.description,
            },
        });
        return NextResponse.json(media);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.media.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}
