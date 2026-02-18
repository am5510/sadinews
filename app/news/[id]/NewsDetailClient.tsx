'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Clock, Activity, Copy, Facebook, Images, Loader2, Film, X, ChevronLeft } from 'lucide-react';
import { NewsItem } from '@/types';
import { useRouter } from 'next/navigation';

const SocialButton = ({ color, icon, onClick, title }: { color: string; icon: React.ReactNode; onClick?: () => void; title?: string }) => (
    <button
        onClick={onClick}
        title={title}
        className={`${color} text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:opacity-90 transition shadow-sm hover:scale-110 active:scale-95`}
    >
        {icon}
    </button>
);

export default function NewsDetailClient({ news, relatedNews }: { news: NewsItem, relatedNews: NewsItem[] }) {
    const router = useRouter();

    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

    useEffect(() => {
        // Increment view count on mount
        if (news?.id) {
            fetch(`/api/news/${news.id}/view`, { method: 'PATCH' }).catch(console.error);
        }
    }, [news?.id]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (selectedImageIndex === null || !news.album) return;

        if (e.key === 'Escape') {
            setSelectedImageIndex(null);
        } else if (e.key === 'ArrowLeft') {
            setSelectedImageIndex((prev) => (prev === null || prev === 0 ? news.album!.length - 1 : prev - 1));
        } else if (e.key === 'ArrowRight') {
            setSelectedImageIndex((prev) => (prev === null || prev === news.album!.length - 1 ? 0 : prev + 1));
        }
    }, [selectedImageIndex, news.album]);

    useEffect(() => {
        if (selectedImageIndex !== null) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden'; // Prevent scrolling when lightbox is open
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'auto';
        };
    }, [selectedImageIndex, handleKeyDown]);

    const currentDate = new Date().toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const contentToRender = news.content || `<p class="mb-6"><b>${news.title}</b></p>...`;

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="container mx-auto px-4 max-w-7xl py-6 animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link href="/" className="flex items-center gap-1 hover:text-red-600 transition">
                        <ArrowLeft size={16} /> หน้าแรก
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-red-600 font-bold">{news.category}</span>
                    <ChevronRight size={14} />
                    <span className="truncate max-w-[200px]">{news.title}</span>
                </div>

                <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-4">{news.title}</h1>

                    <div className="flex items-center justify-between border-t border-b border-gray-100 py-4 mb-6">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1"><Clock size={16} /> {news.time || currentDate}</div>
                            <div className="flex items-center gap-1"><Activity size={16} /> {news.views?.toLocaleString() || '0'} อ่าน</div>
                        </div>

                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-700 mr-2">แชร์เรื่องนี้</span>
                            <SocialButton
                                color="bg-[#06C755]"
                                icon={<span className="font-bold text-sm">LINE</span>}
                                onClick={() => window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                                title="แชร์ผ่าน LINE"
                            />
                            <SocialButton
                                color="bg-black"
                                icon={<span className="font-bold text-sm">𝕏</span>}
                                onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(news.title)}`, '_blank')}
                                title="แชร์ผ่าน X"
                            />
                            <SocialButton
                                color="bg-[#1877F2]"
                                icon={<Facebook size={18} fill="white" />}
                                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                                title="แชร์ผ่าน Facebook"
                            />
                            <SocialButton
                                color="bg-[#F24C3D]"
                                icon={<Copy size={18} />}
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('คัดลอกลิงก์เรียบร้อยแล้ว');
                                }}
                                title="คัดลอกลิงก์"
                            />
                        </div>
                    </div>

                    <div className="rounded-lg overflow-hidden mb-8 aspect-video shadow-sm bg-gray-100">
                        <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
                    </div>

                    <div
                        className="text-gray-800 leading-relaxed space-y-6 news-content"
                        style={{ fontFamily: 'var(--font-noto-sans-thai)' }}
                        dangerouslySetInnerHTML={{ __html: contentToRender }}
                    ></div>

                    {(news.video || news.videoEmbed) && (
                        <div className="mt-8 mb-8">
                            <div className="rounded-xl overflow-hidden shadow-sm bg-black aspect-video relative z-0">
                                {(() => {
                                    if (news.videoType === 'embed') {
                                        return <div className="w-full h-full [&_iframe]:w-full [&_iframe]:h-full" dangerouslySetInnerHTML={{ __html: news.videoEmbed || '' }} />;
                                    }

                                    // Helper to check for YouTube/Vimeo
                                    const getEmbedUrl = (url: string | null | undefined) => {
                                        if (!url) return null;

                                        // YouTube
                                        const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?]+)/);
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

                                    const embedUrl = getEmbedUrl(news.video);

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

                                    return <video src={news.video || ''} controls className="w-full h-full" />;
                                })()}
                            </div>
                        </div>
                    )}

                    {news.album && news.album.length > 0 && (
                        <div className="mt-12 pt-8 border-t border-gray-100">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Images className="text-red-600" size={24} /> อัลบั้มภาพ
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {news.album.map((imgUrl, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-[4/3] overflow-hidden rounded-lg shadow-sm group cursor-pointer hover:shadow-md transition"
                                        onClick={() => setSelectedImageIndex(index)}
                                    >
                                        <img src={imgUrl} alt={`Album ${index + 1}`} className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lightbox */}
                    {selectedImageIndex !== null && news.album && (
                        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm" onClick={() => setSelectedImageIndex(null)}>
                            <button
                                onClick={() => setSelectedImageIndex(null)}
                                className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition z-[60]"
                            >
                                <X size={32} />
                            </button>


                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex((prev) => (prev === null || prev === 0 ? news.album!.length - 1 : prev - 1));
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-[60]"
                            >
                                <ChevronLeft size={40} />
                            </button>

                            <div
                                className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <img
                                    src={news.album[selectedImageIndex]}
                                    alt={`Gallery ${selectedImageIndex + 1}`}
                                    className="max-w-full max-h-full object-contain shadow-2xl rounded-sm"
                                />
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-md">
                                    {selectedImageIndex + 1} / {news.album.length}
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedImageIndex((prev) => (prev === null || prev === news.album!.length - 1 ? 0 : prev + 1));
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white p-3 rounded-full hover:bg-white/10 transition z-[60]"
                            >
                                <ChevronRight size={40} />
                            </button>
                        </div>
                    )}

                    <div className="mt-12 pt-8 border-t border-gray-200">
                        <h3 className="text-xl font-bold mb-6 border-l-4 border-red-600 pl-3">ข่าวที่เกี่ยวข้อง</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {relatedNews.map((item) => (
                                <Link key={item.id} href={`/news/${item.id}`} className="flex gap-4 group cursor-pointer">
                                    <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg">
                                        <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition" alt={item.title} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-red-600 transition mt-1">{item.title}</h4>
                                        <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                            <Clock size={10} /> {item.time}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
