import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const news = await prisma.news.findMany({
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
            },
        });
        return NextResponse.json(news, { status: 201 });
    } catch (error) {
        console.error('Error creating news:', error);
        return NextResponse.json({ error: 'Failed to create news' }, { status: 500 });
    }
}
