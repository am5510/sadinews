'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Clock, Facebook, Play, Loader2, Activity } from 'lucide-react';
import { MediaItem, NewsItem } from '@/types';

const SocialButton = ({ color, icon, onClick, title }: { color: string; icon: React.ReactNode; onClick?: () => void; title?: string }) => (
    <button
        onClick={onClick}
        title={title}
        className={`${color} text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:opacity-90 transition shadow-sm hover:scale-110 active:scale-95`}
    >
        {icon}
    </button>
);

export default function MediaDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [item, setItem] = useState<MediaItem | null>(null);
    const [relatedMedia, setRelatedMedia] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch current media
                const mediaRes = await fetch(`/api/media/${id}`);
                if (!mediaRes.ok) throw new Error('Media not found');
                const mediaData = await mediaRes.json();
                setItem(mediaData);

                // Fetch related media
                const allMediaRes = await fetch('/api/media');
                if (allMediaRes.ok) {
                    const allMedia = await allMediaRes.json();
                    const others = allMedia.filter((m: MediaItem) => m.id !== id);

                    if (others.length > 0) {
                        setRelatedMedia(others.slice(0, 4));
                    } else {
                        // Fallback to news as related media (preserve original behavior)
                        const newsRes = await fetch('/api/news');
                        if (newsRes.ok) {
                            const newsList = await newsRes.json();
                            const mappedNews = newsList.slice(0, 4).map((n: NewsItem) => ({
                                id: `related-${n.id}`,
                                category: 'image',
                                sourceType: 'link',
                                url: n.image,
                                title: n.title,
                                type: 'image'
                            }));
                            setRelatedMedia(mappedNews);
                        }
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            // Increment view count
            fetch(`/api/media/${id}/view`, { method: 'PATCH' }).catch(console.error);
            fetchData();
        }
    }, [id]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 size={48} className="animate-spin text-purple-600" />
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <p className="mb-4">ไม่พบสื่อที่คุณต้องการ</p>
                <Link href="/" className="text-red-600 hover:underline">กลับสู่หน้าแรก</Link>
            </div>
        );
    }

    const currentDate = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

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
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700 mr-2 hidden sm:inline">แชร์</span>
                            <SocialButton
                                color="bg-[#06C755]"
                                icon={<span className="font-bold text-sm">LINE</span>}
                                onClick={() => window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                title="แชร์ผ่าน LINE"
                            />
                            <SocialButton
                                color="bg-[#1877F2]"
                                icon={<Facebook size={16} fill="white" />}
                                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                                title="แชร์ผ่าน Facebook"
                            />
                        </div>
                    </div>

                    <div className="rounded-xl overflow-hidden mb-8 aspect-video shadow-md bg-black flex items-center justify-center">
                        {(() => {
                            if (item.sourceType === 'embed') {
                                return <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: item.embedCode || '' }} />;
                            }

                            if (item.category === 'video' || item.type === 'video') {
                                // Helper to check for YouTube/Vimeo
                                const getEmbedUrl = (url: string) => {
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

                                const embedUrl = item.url ? getEmbedUrl(item.url) : null;

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

                                return <video src={item.url || ''} className="w-full h-full" controls autoPlay />;
                            }

                            return <img src={item.url || ''} alt={item.title} className="w-full h-full object-contain" />;
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
                            {relatedMedia.map((relItem, idx) => {
                                // Calculate thumbnail URL
                                const getThumbnailUrl = (item: any) => {
                                    if (item.coverImage) return item.coverImage;

                                    if (item.category === 'video' || item.type === 'video') {
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
                                    <Link key={idx} href={`/media/${relItem.id}`} className="group cursor-pointer">
                                        <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-sm">
                                            {/* @ts-ignore */}
                                            <img
                                                src={getThumbnailUrl(relItem)}
                                                alt={relItem.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                                                }}
                                            />
                                            {/* @ts-ignore */}

                                        </div>
                                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-purple-600 transition">{relItem.title}</h4>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
