import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Calendar, Clock, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export const revalidate = 60;

export async function generateStaticParams() {
    const trainings = await prisma.training.findMany({
        select: { id: true },
    });
    return trainings.map((item) => ({
        id: item.id,
    }));
}

interface Props {
    params: Promise<{ id: string }>;
}

export default async function TrainingDetailPage({ params }: Props) {
    const { id } = await params;

    const event = await prisma.training.findUnique({
        where: { id },
    });

    if (!event) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
                <p className="mb-4">ไม่พบหลักสูตรที่คุณต้องการ</p>
                <Link href="/" className="text-red-600 hover:underline">กลับสู่หน้าแรก</Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            <div className="container mx-auto px-4 max-w-7xl py-10 animate-fade-in">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link href="/" className="flex items-center gap-1 hover:text-red-600 transition">
                        <ArrowLeft size={16} /> หน้าแรก
                    </Link>
                    <ChevronRight size={14} />
                    <Link href="/trainings" className="hover:text-red-600 transition">ปฏิทินการจัดอบรม</Link>
                    <ChevronRight size={14} />
                    <span className="font-bold text-gray-900 truncate max-w-[200px]">{event.title}</span>
                </div>

                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <div className="relative z-10">
                            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm mb-4 inline-block border border-white/30">{event.type}</span>
                            <h1 className="text-xl md:text-2xl font-bold leading-tight mb-4">{event.title}</h1>
                            <div className="flex flex-wrap gap-4 text-sm opacity-90">
                                <div className="flex items-center gap-1.5"><Calendar size={16} /> {event.date}/{event.month + 1}/{event.year}</div>
                                <div className="flex items-center gap-1.5"><Clock size={16} /> {event.time}</div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="text-red-600" size={24} /> รายละเอียดหลักสูตร
                        </h3>
                        <div className="text-gray-600 leading-relaxed space-y-4 font-sans">
                            <div dangerouslySetInnerHTML={{ __html: event.description || 'หลักสูตรนี้ออกแบบมาเพื่อให้ผู้เข้าอบรมมีความรู้ความเข้าใจเกี่ยวกับ...' }} className="prose prose-red max-w-none [&_img]:w-full [&_img]:rounded-lg [&_img]:my-4" />
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start gap-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0 overflow-hidden border-2 border-gray-100 relative">
                            <Image
                                src={event.speakerImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop"}
                                alt="Speaker"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 text-lg">วิทยากร: {event.speaker || '-'}</h4>
                            <p className="text-sm text-gray-500 mt-1">{event.speakerPosition || 'ผู้เชี่ยวชาญที่มีประสบการณ์'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
