'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Home, Bell, Calendar, Film, Settings, X } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const isActive = (path: string) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname?.startsWith(path)) return true;
        return false;
    };

    return (
        <>
            <header className="bg-red-700 shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button className="lg:hidden text-white hover:text-gray-200 transition" onClick={() => setIsMobileMenuOpen(true)}>
                                <Menu size={24} />
                            </button>
                            <Link href="/" className="flex items-center gap-2 group">
                                <div className="text-3xl tracking-tighter text-white flex items-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                    <span className="font-bold mr-1">Sadi</span><span className="font-light">News</span>
                                </div>
                            </Link>
                        </div>

                        <div className="hidden lg:flex items-center gap-6 text-sm font-medium text-red-100 flex-1 justify-end mr-6">
                            <Link href="/" className={`hover:text-white transition-colors flex items-center gap-1.5 group ${isActive('/') ? 'text-white font-bold' : ''}`}>
                                <Home size={18} /> หน้าแรก
                            </Link>
                            <Link href="/news" className={`hover:text-white transition-colors flex items-center gap-1.5 group ${isActive('/news') ? 'text-white font-bold' : ''}`}>
                                <Bell size={18} className={!isActive('/news') ? "group-hover:animate-swing" : ""} /> ข่าวอัพเดท
                            </Link>
                            <Link href="/trainings" className={`hover:text-white transition-colors flex items-center gap-1.5 group ${isActive('/trainings') ? 'text-white font-bold' : ''}`}>
                                <Calendar size={18} /> ปฏิทินการจัดอบรม
                            </Link>
                            <Link href="/media" className={`hover:text-white transition-colors flex items-center gap-1.5 group ${isActive('/media') ? 'text-white font-bold' : ''}`}>
                                <Film size={18} /> Media
                            </Link>
                        </div>


                    </div>
                </div>
            </header>

            {isMobileMenuOpen && (
                <div className="fixed inset-0 z-[60] lg:hidden">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
                    <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-white shadow-2xl p-6 animate-slide-in-left flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <div className="text-3xl tracking-tighter text-black flex items-center" style={{ fontFamily: "'Poppins', sans-serif" }}>
                                <span className="font-bold mr-1">Sadi</span><span className="font-light">News</span>
                            </div>
                            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-red-600"><X size={24} /></button>
                        </div>
                        <nav className="flex flex-col gap-2">
                            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/') ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                <Home size={20} /> หน้าแรก
                            </Link>
                            <Link href="/news" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/news') ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                <Bell size={20} /> ข่าวอัพเดท
                            </Link>
                            <Link href="/trainings" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/trainings') ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                <Calendar size={20} /> ปฏิทินการจัดอบรม
                            </Link>
                            <Link href="/media" onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive('/media') ? 'bg-red-50 text-red-600 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}>
                                <Film size={20} /> Media
                            </Link>
                        </nav>

                    </div>
                </div>
            )}
        </>
    );
}
