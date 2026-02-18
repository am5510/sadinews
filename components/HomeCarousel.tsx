'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Clock, Play } from 'lucide-react';
import { NewsItem } from '@/types';

interface HomeCarouselProps {
    featuredNews: NewsItem[];
}

export default function HomeCarousel({ featuredNews }: HomeCarouselProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    useEffect(() => {
        if (featuredNews.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [featuredNews.length]);

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // Reset touch end
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Swipe Left -> Next Slide
            setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
        } else if (isRightSwipe) {
            // Swipe Right -> Prev Slide
            setCurrentSlide((prev) => (prev === 0 ? featuredNews.length - 1 : prev - 1));
        }
    };

    const nextSlide = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentSlide((prev) => (prev + 1) % featuredNews.length);
    };

    const prevSlide = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentSlide((prev) => (prev === 0 ? featuredNews.length - 1 : prev - 1));
    };

    if (featuredNews.length === 0) return null;

    return (
        <div
            className="lg:col-span-2 group relative rounded-xl overflow-hidden shadow-sm aspect-video touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div
                className="flex h-full transition-transform ease-in-out duration-500"
                style={{
                    transform: `translateX(-${currentSlide * (100 / featuredNews.length)}%)`,
                    width: `${featuredNews.length * 100}%`
                }}
            >
                {featuredNews.map((item, index) => (
                    <div
                        key={item.id}
                        className="relative w-full h-full flex-shrink-0"
                        style={{ width: `${100 / featuredNews.length}%` }}
                    >
                        <Link href={`/news/${item.id}`} className="block w-full h-full relative">
                            <Image
                                src={item.image}
                                alt={item.title}
                                fill
                                className="object-cover"
                                priority={index === 0}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-4 pb-2 text-white w-full pr-16 bg-gradient-to-t from-black/80 to-transparent pt-12">
                                <h2 className="text-lg md:text-xl lg:text-2xl font-bold leading-tight mb-1 drop-shadow-md line-clamp-2">
                                    {item.title}
                                </h2>
                                <div className="flex items-center gap-4 text-gray-300 text-xs">
                                    <span className="flex items-center gap-1">
                                        <Clock size={12} /> {item.time}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Play size={12} /> {item.views?.toLocaleString() || '0'}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            >
                <ChevronLeft size={24} />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full backdrop-blur-sm transition z-20 opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
            >
                <ChevronRight size={24} />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
                {featuredNews.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={(e) => {
                            e.preventDefault();
                            setCurrentSlide(idx);
                        }}
                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-red-600 w-6' : 'bg-white/50 hover:bg-white'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
