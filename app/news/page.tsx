import React from 'react';
import Link from 'next/link';
import { Bell, Clock, ArrowRight } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export const revalidate = 60;

export default async function AllNewsPage() {
    const newsList = await prisma.news.findMany({
        where: { isVisible: { not: false } },
        orderBy: { createdAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

            <main className="flex-1 container mx-auto px-4 max-w-7xl py-8 animate-fade-in">
                <div className="flex items-center gap-2 mb-6 ml-2">
                    <Bell className="text-red-600" />
                    <h2 className="text-2xl font-bold text-gray-800">ข่าวประชาสัมพันธ์ทั้งหมด</h2>
                    <span className="text-sm font-normal text-gray-500 ml-2">({newsList.length} รายการ)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {newsList.map((news) => (
                        <Link key={news.id} href={`/news/${news.id}`} className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition group flex flex-col h-full border border-gray-100">
                            <div className="relative aspect-video overflow-hidden">
                                {news.category && (
                                    <div className="absolute top-2 right-2 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg z-10 uppercase tracking-wider hidden">{news.category}</div>
                                )}
                                <div className="relative w-full h-full">
                                    <Image
                                        src={news.image || 'https://placehold.co/600x400'}
                                        alt={news.title}
                                        fill
                                        className="object-cover transform group-hover:scale-110 transition duration-700"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                    />
                                </div>
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
            </main>

        </div>
    );
}
