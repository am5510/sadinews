
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const media = await prisma.media.update({
            where: { id },
            data: {
                views: {
                    increment: 1,
                },
            },
        });

        return NextResponse.json(media);
    } catch (error) {
        console.error('Error incrementing media view:', error);
        return NextResponse.json(
            { error: 'Error incrementing view count' },
            { status: 500 }
        );
    }
}
