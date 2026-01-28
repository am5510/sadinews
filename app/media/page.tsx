import React from 'react';
import { prisma } from '@/lib/prisma';
import MediaGallery from '@/components/MediaGallery';

export const revalidate = 60; // ISR: Update detail every 60 seconds

async function getMedia() {
    const media = await prisma.media.findMany({
        orderBy: { createdAt: 'desc' },
    });
    return media;
}

export default async function MediaPage() {
    const mediaList = await getMedia();

    // Fix inconsistent data structure if needed
    // This mirrors the logic we added to the homepage to safely handle types
    const sanitizedMedia = mediaList.map(item => ({
        ...item,
        // Add defaults for potentially missing fields if the database allows nulls
        // that conflict with UI expectations
        views: item.views || 0,
        url: item.url || '', // Ensure url is not null if definition says string
        embedCode: item.embedCode || undefined,
        description: item.description || undefined,
    }));

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <main className="flex-1">
                <MediaGallery initialMedia={sanitizedMedia} />
            </main>
        </div>
    );
}

