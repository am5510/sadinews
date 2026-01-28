'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Clock, ArrowRight, Loader2 } from 'lucide-react';
import { NewsItem } from '@/types';


export default function AllNewsPage() {
    const [newsList, setNewsList] = useState<NewsItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const res = await fetch('/api/news');
                if (res.ok) setNewsList(await res.json());
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

            <main className="flex-1 container mx-auto px-4 max-w-7xl py-8 animate-fade-in">
                <div className="flex items-center gap-2 mb-6 ml-2">
                    <Bell className="text-red-600" />
                    <h2 className="text-2xl font-bold text-gray-800">ข่าวประชาสัมพันธ์ทั้งหมด</h2>
                    <span className="text-sm font-normal text-gray-500 ml-2">({newsList.length} รายการ)</span>
                </div>

                {isLoading ? (
                    <div className="flex justify-center py-20"><Loader2 size={48} className="animate-spin text-red-600" /></div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {newsList.map((news) => (
                            <Link key={news.id} href={`/news/${news.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group flex flex-col h-full border border-gray-100">
                                <div className="relative aspect-video overflow-hidden">
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 uppercase tracking-wider hidden">{news.category}</div>
                                    <img src={news.image} alt={news.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                                </div>
                                <div className="p-5 flex flex-col flex-1">
                                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Clock size={12} /> {news.time}</div>
                                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition text-lg">{news.title}</h3>
                                    <div className="mt-auto pt-4 flex items-center text-red-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition transform translate-y-2 group-hover:translate-y-0">
                                        อ่านเพิ่มเติม <ArrowRight size={14} className="ml-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </main>

        </div>
    );
}
