import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const news = await prisma.news.findUnique({ where: { id } });
        if (!news) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(news);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const news = await prisma.news.update({
            where: { id },
            data: {
                title: body.title,
                category: body.category,
                image: body.image,
                album: body.album,
                time: body.time,
                content: body.content,
            },
        });
        return NextResponse.json(news);
    } catch (error) {
        console.error('Error updating news:', error);
        return NextResponse.json({ error: 'Failed to update news' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.news.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting news:', error);
        return NextResponse.json({ error: 'Failed to delete news' }, { status: 500 });
    }
}
