'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Film, Play, Image as ImageIcon, Video } from 'lucide-react';
import { MediaItem } from '@/types';

interface MediaGalleryProps {
    initialMedia: MediaItem[];
}

export default function MediaGallery({ initialMedia }: MediaGalleryProps) {
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

    // Logic to determine if an item matches the filter
    // The existing code checked item.type as well, so we keep that for compatibility
    const filteredMedia = filter === 'all'
        ? initialMedia
        : initialMedia.filter(m => m.category === filter || m.type === filter || (filter === 'video' && m.sourceType === 'video'));

    return (
        <div className="container mx-auto px-4 max-w-7xl py-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2 ml-2">
                    <Film className="text-red-600" />
                    <h2 className="text-2xl font-bold text-gray-800">Media Gallery</h2>
                </div>
                <div className="flex bg-gray-200 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filter === 'all' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        ทั้งหมด
                    </button>
                    <button
                        onClick={() => setFilter('image')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filter === 'image' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        รูปภาพ
                    </button>
                    <button
                        onClick={() => setFilter('video')}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filter === 'video' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        วิดีโอ
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredMedia.map((item) => (
                    <Link key={item.id} href={`/media/${item.id}`} className="group cursor-pointer">
                        <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3 relative shadow-sm border border-gray-100">
                            <div className="absolute top-2 left-2 z-10">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase text-white shadow-sm ${item.category === 'image' ? 'bg-blue-600' : 'bg-red-600'}`}>
                                    {item.category === 'image' ? <ImageIcon size={12} /> : <Video size={12} />}
                                </span>
                            </div>

                            {/* Image optimization */}
                            {/* @ts-ignore */}
                            <Image
                                src={item.url || '/placeholder.jpg'}
                                alt={item.title}
                                fill
                                className="object-cover group-hover:scale-110 transition duration-700"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                            />

                            {/* Play icon overlay for videos */}
                            {(item.category === 'video' || item.type === 'video' || item.sourceType === 'video') && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition">
                                    <div className="bg-white/30 backdrop-blur-md p-3 rounded-full border border-white/50 shadow-lg group-hover:scale-110 transition">
                                        <Play fill="white" className="text-white" size={24} />
                                    </div>
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300 flex flex-col justify-end p-4">
                                <p className="text-white font-medium text-sm line-clamp-2">{item.title}</p>
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition line-clamp-2 leading-snug">{item.title}</h3>
                    </Link>
                ))}
            </div>
        </div>
    );
}
