import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('all') === 'true';

        const where = showAll ? {} : { isVisible: { not: false } };

        const news = await prisma.news.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const news = await prisma.news.create({
            data: {
                title: body.title,
                category: body.category || 'ทั่วไป',
                image: body.image,
                album: body.album || [],
                time: body.time || 'เมื่อสักครู่',
                content: body.content,
                video: body.video,
                videoType: body.videoType,
                videoEmbed: body.videoEmbed,
                isVisible: body.isVisible !== undefined ? body.isVisible : true,
            },
        });
        return NextResponse.json(news, { status: 201 });
    } catch (error) {
        console.error('Error creating news:', error);
        const errorMessage = (error as any)?.message || String(error) || 'Failed to create news';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
