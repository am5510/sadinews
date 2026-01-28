'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, MapPin, Play, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { NewsItem, TrainingItem, MediaItem } from '@/types';


export default function Home() {
  const [data, setData] = useState<{
    news: NewsItem[];
    trainings: TrainingItem[];
    media: MediaItem[];
  }>({ news: [], trainings: [], media: [] });
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [newsRes, trainingsRes, mediaRes] = await Promise.all([
          fetch('/api/news'),
          fetch('/api/trainings'),
          fetch('/api/media'),
        ]);

        const news = newsRes.ok ? await newsRes.json() : [];
        const trainings = trainingsRes.ok ? await trainingsRes.json() : [];
        const media = mediaRes.ok ? await mediaRes.json() : [];

        setData({ news, trainings, media });
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Carousel Logic


  // Carousel Logic
  const [currentSlide, setCurrentSlide] = useState(0);
  const featuredNews = data.news.slice(0, 5);

  useEffect(() => {
    if (featuredNews.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [featuredNews.length]);

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
  };

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentSlide((prev) => (prev === 0 ? featuredNews.length - 1 : prev - 1));
  };

  const months = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">


      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 size={48} className="animate-spin text-red-600" /></div>
      ) : (
        <main className="flex-1">
          {/* Hero Carousel */}
          {/* Hero Section Grid */}
          <div className="bg-white pt-8 pb-4">
            <div className="container mx-auto px-4 max-w-7xl">
              {/* Hero Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="flex items-baseline gap-4">
                  <h1 className="text-3xl font-bold text-gray-900">เรื่องเด่นวันนี้</h1>
                  <span className="text-gray-500 text-sm">วันพฤหัสบดีที่ 15 มกราคม 2569</span>
                </div>

              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Highlight (Left - 2/3) */}
                {/* Main Highlight (Left - 2/3) - Carousel */}
                {featuredNews.length > 0 && (
                  <div className="lg:col-span-2 group relative rounded-xl overflow-hidden shadow-sm aspect-video">
                    <Link href={`/news/${featuredNews[currentSlide].id}`} className="block w-full h-full relative">
                      {/* Image with Fade Transition */}
                      <img key={currentSlide} src={featuredNews[currentSlide].image} alt={featuredNews[currentSlide].title} className="w-full h-full object-cover transform hover:scale-105 transition duration-700 animate-fade-in" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 p-6 md:p-8 text-white w-full pr-16">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded hidden">{featuredNews[currentSlide].category || 'ข่าวเด่น'}</span>
                        </div>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-3 drop-shadow-md line-clamp-2">
                          {featuredNews[currentSlide].title}
                        </h2>
                        <div className="flex items-center gap-4 text-gray-300 text-sm">
                          <span className="flex items-center gap-1"><Clock size={14} /> {featuredNews[currentSlide].time}</span>
                          <span className="flex items-center gap-1"><Play size={14} /> {featuredNews[currentSlide].views?.toLocaleString() || '0'}</span>
                        </div>
                      </div>
                    </Link>

                    {/* Controls */}
                    <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition z-10 opacity-0 group-hover:opacity-100">
                      <ChevronLeft size={24} />
                    </button>
                    <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition z-10 opacity-0 group-hover:opacity-100">
                      <ChevronRight size={24} />
                    </button>

                    {/* Indicators */}
                    <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
                      {featuredNews.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.preventDefault(); setCurrentSlide(idx); }}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-red-600 w-6' : 'bg-white/50 hover:bg-white'}`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Side Grid (Right - 1/3) -> 2x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 lg:gap-x-4 lg:gap-y-6 gap-4">
                  {featuredNews.slice(1, 5).map((news) => (
                    <Link key={news.id} href={`/news/${news.id}`} className="group cursor-pointer flex flex-col gap-2">
                      <div className="w-full aspect-video rounded-lg overflow-hidden relative shadow-sm">
                        <img src={news.image} alt={news.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500" />
                      </div>
                      <h3 className="font-bold text-sm md:text-base text-gray-900 group-hover:text-red-700 line-clamp-3 leading-snug">
                        {news.title}
                      </h3>
                      <div className="text-xs text-gray-400 flex items-center gap-1 mt-auto">
                        <Clock size={12} /> {news.time}
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
                {data.news.slice(0, 4).map((news) => (
                  <Link key={news.id} href={`/news/${news.id}`} className="group cursor-pointer">
                    <div className="overflow-hidden rounded-xl mb-4 relative shadow-sm aspect-video">

                      <img src={news.image} alt={news.title} className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700" />
                    </div>
                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-1"><Clock size={12} /> {news.time}</div>
                    <h3 className="font-bold text-lg text-gray-900 leading-snug group-hover:text-red-600 transition line-clamp-2 mb-2">{news.title}</h3>
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
                {data.trainings.slice(0, 4).map((item) => (
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
                {data.media.slice(0, 4).map((item) => (
                  <Link key={item.id} href={`/media/${item.id}`} className="group cursor-pointer">
                    <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-2 relative shadow-md">
                      {/* @ts-ignore */}
                      <img src={item.url || item.image} alt={item.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition duration-500" />
                      {/* @ts-ignore */}
                      {(item.category === 'video' || item.type === 'video') && (
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
      )}


    </div>
  );
}