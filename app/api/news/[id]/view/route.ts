
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const news = await prisma.news.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json(news);
    } catch (error) {
        console.error('Error incrementing news view:', error);
        return NextResponse.json(
            { error: 'Error incrementing view count' },
            { status: 500 }
        );
    }
}
