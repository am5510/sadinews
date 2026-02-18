import React from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { prisma } from '@/lib/prisma';
import NewsDetailClient from './NewsDetailClient';
import Link from 'next/link';
import { NewsItem } from '@/types';

export const revalidate = 60;

export async function generateStaticParams() {
    const news = await prisma.news.findMany({
        select: { id: true },
    });
    return news.map((item) => ({
        id: item.id,
    }));
}

interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const news = await prisma.news.findUnique({ where: { id } });

    if (!news) {
        return {
            title: 'News Not Found',
        };
    }

    const previousImages = (await parent).openGraph?.images || [];

    return {
        title: news.title,
        description: news.content ? news.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...' : 'อ่านข่าวเพิ่มเติม...',
        openGraph: {
            title: news.title,
            description: news.content ? news.content.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...' : undefined,
            images: news.image ? [news.image as string, ...previousImages] : previousImages,
        },
    };
}

export default async function NewsDetailPage({ params }: Props) {
    const { id } = await params;
    const news = await prisma.news.findUnique({ where: { id } });

    if (!news) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <p className="mb-4">ไม่พบข่าวที่คุณต้องการ</p>
                <Link href="/" className="text-red-600 hover:underline">กลับสู่หน้าแรก</Link>
            </div>
        );
    }

    // Fetch related news
    const relatedNewsRaw = await prisma.news.findMany({
        where: { NOT: { id: id } },
        take: 4,
        orderBy: { createdAt: 'desc' }
    });

    const relatedNews = relatedNewsRaw.map(item => ({
        ...item,
        views: item.views ?? 0,
        createdAt: item.createdAt ? item.createdAt.toISOString() : undefined
    })) as unknown as NewsItem[];

    // Convert news dates/types to match client expectations if necessary
    const serializedNews = {
        ...news,
        views: news.views ?? 0,
        createdAt: news.createdAt ? news.createdAt.toISOString() : undefined
    } as unknown as NewsItem;

    return <NewsDetailClient news={serializedNews} relatedNews={relatedNews} />;
}
