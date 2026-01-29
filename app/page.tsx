import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Clock, MapPin, Play } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import HomeCarousel from '@/components/HomeCarousel';

export const revalidate = 60;

// Helper to format dates or ensure serializable data if needed
const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

async function getNews() {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
  });
  // Convert Date objects to strings for serialization if necessary
  return news.map(item => ({
    ...item,
    createdAt: item.createdAt?.toISOString(),
    image: item.image || '/placeholder.jpg',
    // Ensure all required fields for types are present or defaulted
    album: item.album || [],
    views: item.views || 0,
    content: item.content || undefined,
    video: item.video || undefined,
    videoType: item.videoType || undefined,
    videoEmbed: item.videoEmbed || undefined,
  }));
}

async function getTrainings() {
  const trainings = await prisma.training.findMany({
    orderBy: { createdAt: 'desc' },
    take: 4,
  });
  return trainings;
}

async function getMedia() {
  const media = await prisma.media.findMany({
    orderBy: { createdAt: 'desc' },
    take: 4,
  });
  return media;
}

export default async function Home() {
  const [news, trainings, media] = await Promise.all([
    getNews(),
    getTrainings(),
    getMedia()
  ]);

  const featuredNews = news.slice(0, 5);

  // Current Date for Header
  const now = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const currentDate = now.toLocaleDateString('th-TH', dateOptions);

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      <main className="flex-1">
        {/* Hero Section Grid */}
        <div className="bg-white pt-8 pb-4">
          <div className="container mx-auto px-4 max-w-7xl">
            {/* Hero Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="flex items-baseline gap-4">
                <h1 className="text-3xl font-bold text-gray-900">เรื่องเด่นวันนี้</h1>
                <span className="text-gray-500 text-sm">{currentDate}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Highlight (Left - 2/3) - Carousel */}
              <HomeCarousel featuredNews={featuredNews} />

              {/* Side Grid (Right - 1/3) -> 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:gap-x-4 lg:gap-y-6 gap-4">
                {featuredNews.slice(1, 5).map((item) => (
                  <Link key={item.id} href={`/news/${item.id}`} className="group cursor-pointer flex flex-col gap-2">
                    <div className="w-full aspect-video rounded-lg overflow-hidden relative shadow-sm">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transform group-hover:scale-110 transition duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <h3 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-red-700 line-clamp-3 leading-snug">
                      {item.title}
                    </h3>
                    <div className="text-xs text-gray-400 flex items-center gap-1 mt-auto">
                      <Clock size={12} /> {item.time}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Latest News */}
        <div className="py-8 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h3 className="text-red-600 font-bold uppercase tracking-widest text-sm mb-2">Update</h3>
                <h2 className="text-3xl font-bold text-gray-900">ข่าวประชาสัมพันธ์ล่าสุด</h2>
              </div>
              <Link href="/news" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-red-600 transition font-medium group">
                ดูทั้งหมด <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {news.slice(0, 4).map((item) => (
                <Link key={item.id} href={`/news/${item.id}`} className="group cursor-pointer">
                  <div className="overflow-hidden rounded-xl mb-4 relative shadow-sm aspect-video">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transform group-hover:scale-110 transition duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                  </div>
                  <div className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Clock size={12} /> {item.time}</div>
                  <h3 className="font-bold text-lg text-gray-900 leading-snug group-hover:text-red-600 transition line-clamp-2 mb-2">{item.title}</h3>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/news" className="inline-block border border-gray-300 px-6 py-2 rounded-full text-sm hover:bg-gray-50 transition">ดูข่าวทั้งหมด</Link>
            </div>
          </div>
        </div>

        {/* Training Schedule */}
        <div className="py-8 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">ปฏิทินการจัดอบรม</h2>
              </div>
              <Link href="/trainings" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-blue-600 transition font-medium group">
                ดูตารางทั้งหมด <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {trainings.map((item) => (
                <Link key={item.id} href={`/trainings/${item.id}`} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition group">
                  <div className="flex flex-col items-center justify-center bg-blue-50 text-blue-600 w-16 h-16 rounded-xl flex-shrink-0 border border-blue-100">
                    <span className="text-xl font-bold font-mono">{item.date}</span>
                    <span className="text-xs">{months[item.month]}</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center h-full min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${item.type === 'Online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>{item.type}</span>
                      <span className="text-xs text-gray-400 flex items-center gap-1 truncate"><Clock size={10} /> {item.time}</span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 mb-1 group-hover:text-blue-600 transition line-clamp-1">{item.title}</h3>
                    <div className="text-xs text-gray-500 flex items-center gap-3">
                      <span className="flex items-center gap-1 truncate"><MapPin size={10} /> {item.location}</span>
                    </div>
                  </div>
                  <div className="self-center bg-gray-50 hover:bg-blue-600 hover:text-white p-2 rounded-full transition flex-shrink-0">
                    <ArrowRight size={16} />
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/trainings" className="inline-block border border-gray-300 px-6 py-2 rounded-full text-sm hover:bg-gray-50 transition">ดูตารางทั้งหมด</Link>
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        <div className="py-8 bg-white">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="flex justify-between items-end mb-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">สื่อมัลติมีเดียล่าสุด</h2>
              </div>
              <Link href="/media" className="hidden md:flex items-center gap-2 text-gray-500 hover:text-purple-600 transition font-medium group">
                ดูทั้งหมด <ArrowRight size={18} className="group-hover:translate-x-1 transition" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {media.map((item) => (
                <Link key={item.id} href={`/media/${item.id}`} className="group cursor-pointer">
                  <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-md">
                    {/* @ts-ignore */}
                    <Image
                      src={(() => {
                        // 1. Use Cover Image if available
                        // @ts-ignore
                        if (item.coverImage) return item.coverImage;

                        // 2. If it's a video, try to get a thumbnail
                        // @ts-ignore
                        if (item.category === 'video' || item.sourceType === 'video') {
                          // YouTube Thumbnail
                          // @ts-ignore
                          const ytMatch = item.url?.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?]+)/);
                          if (ytMatch && ytMatch[1]) {
                            return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                          }
                          // Fallback to placeholder for other videos
                          return '/placeholder-video.jpg';
                        }

                        // 3. Fallback to original URL (for images) or generic placeholder
                        // @ts-ignore
                        return item.url || '/placeholder.jpg';
                      })()}
                      // @ts-ignore
                      alt={item.title}
                      fill
                      className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition duration-500"
                      sizes="(max-width: 768px) 50vw, 25vw"
                    />
                    {/* @ts-ignore */}
                    {/* @ts-ignore */}
                    {(item.category === 'video' || item.sourceType === 'video') && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/30 backdrop-blur-sm p-2 rounded-full border border-white/50 group-hover:scale-110 transition">
                        <Play fill="white" className="text-white" size={16} />
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium line-clamp-2 text-gray-900 group-hover:text-purple-600 transition">{item.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}