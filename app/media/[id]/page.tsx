import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Clock, Activity } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import SocialShare from './SocialShare';
import { MediaItem } from '@/types';

export const revalidate = 60;

export async function generateStaticParams() {
    const media = await prisma.media.findMany({
        select: { id: true },
    });
    return media.map((item) => ({
        id: item.id,
    }));
}

interface Props {
    params: Promise<{ id: string }>;
}

async function getRelatedMedia(currentId: string) {
    const media = await prisma.media.findMany({
        where: { NOT: { id: currentId } },
        take: 4,
        orderBy: { createdAt: 'desc' },
    });

    if (media.length > 0) return media;

    // Fallback to news if no other media
    const news = await prisma.news.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
    });

    return news.map(n => ({
        id: `related-${n.id}`,
        title: n.title,
        coverImage: n.image,
        category: 'image',
        url: n.image,
        createdAt: n.createdAt,
    }));
}

export default async function MediaDetailPage({ params }: Props) {
    const { id } = await params;

    const item = await prisma.media.findUnique({
        where: { id },
    });

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <p className="mb-4">ไม่พบสื่อที่คุณต้องการ</p>
                <Link href="/" className="text-red-600 hover:underline">กลับสู่หน้าแรก</Link>
            </div>
        );
    }

    // Increment view count (This needs to be done via a separate API call or Server Action if we want it to be live, 
    // but for SSG/ISR, we might skip strictly real-time view counting on the server render itself, 
    // or use a client component to trigger it. For now, we will omit the side-effect fetch in the server component).
    // Ideally, add a client component just for "ViewCounter".

    const relatedMedia = await getRelatedMedia(id);

    const currentDate = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // Helper to check for YouTube/Vimeo
    const getEmbedUrl = (url: string | null) => {
        if (!url) return null;

        // YouTube
        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
        if (ytMatch && ytMatch[1]) {
            return `https://www.youtube.com/embed/${ytMatch[1]}`;
        }

        // Vimeo
        const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
        if (vimeoMatch && vimeoMatch[1]) {
            return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
        }

        return null;
    };

    const getThumbnailUrl = (item: any) => {
        if (item.coverImage) return item.coverImage;

        if (item.category === 'video') {
            if (item.url) {
                // YouTube
                const ytMatch = item.url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
                if (ytMatch && ytMatch[1]) {
                    return `https://img.youtube.com/vi/${ytMatch[1]}/mqdefault.jpg`;
                }
            }
            // Fallback for video without cover
            return 'https://placehold.co/600x400?text=Video';
        }

        return item.url || item.image || 'https://placehold.co/600x400?text=No+Image';
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="container mx-auto px-4 max-w-7xl py-6 animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link href="/" className="flex items-center gap-1 hover:text-red-600 transition">
                        <ArrowLeft size={16} /> หน้าแรก
                    </Link>
                    <ChevronRight size={14} />
                    <Link href="/media" className="hover:text-red-600 transition font-bold text-red-600">Media Gallery</Link>
                    <ChevronRight size={14} />
                    <span className="truncate max-w-[200px]">{item.title}</span>
                </div>

                <div className="max-w-5xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4">{item.title}</h1>

                    <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 mb-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold uppercase">{item.category}</span>
                            <div className="flex items-center gap-1"><Clock size={16} /> {currentDate}</div>
                            <div className="flex items-center gap-1 text-gray-500"><Activity size={16} /> {item.views?.toLocaleString() || '0'} รับชม</div>
                        </div>
                        <SocialShare title={item.title} />
                    </div>

                    <div className="rounded-xl overflow-hidden mb-8 aspect-video shadow-md bg-black flex items-center justify-center relative">
                        {(() => {
                            if (item.sourceType === 'embed' && item.embedCode) {
                                return <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.embedCode }} />;
                            }

                            if (item.category === 'video') {
                                const embedUrl = getEmbedUrl(item.url);
                                if (embedUrl) {
                                    return (
                                        <iframe
                                            src={embedUrl}
                                            className="w-full h-full"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    );
                                }
                                return <video src={item.url || ''} className="w-full h-full" controls />;
                            }

                            return (
                                <Image
                                    src={item.url || ''}
                                    alt={item.title}
                                    fill
                                    className="object-contain"
                                />
                            );
                        })()}
                    </div>

                    {/* Description */}
                    {item.description && (
                        <div className="mb-12">
                            <div
                                className="news-content text-gray-700 leading-relaxed space-y-4"
                                dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-xl font-bold mb-6 border-l-4 border-purple-600 pl-3 flex items-center gap-2">สื่อที่เกี่ยวข้อง</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {relatedMedia.map((relItem: any, idx) => (
                                <Link key={idx} href={relItem.id.startsWith('related-') ? '#' : `/media/${relItem.id}`} className="group cursor-pointer">
                                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-sm">
                                        <Image
                                            src={getThumbnailUrl(relItem)}
                                            alt={relItem.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition duration-500"
                                        />
                                    </div>
                                    <h4 className="text-sm font-medium line-clamp-2 group-hover:text-purple-600 transition">{relItem.title}</h4>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
