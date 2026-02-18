'use client';

import React from 'react';
import { Facebook } from 'lucide-react';

const SocialButton = ({ color, icon, onClick, title, href }: { color: string; icon: React.ReactNode; onClick?: () => void; title?: string; href?: string }) => {
    const Component = href ? 'a' : 'button';
    const props = href ? { href, target: '_blank', rel: 'noopener noreferrer' } : { onClick };

    return (
        // @ts-ignore
        <Component
            {...props}
            title={title}
            className={`${color} text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center hover:opacity-90 transition shadow-sm hover:scale-110 active:scale-95 cursor-pointer`}
        >
            {icon}
        </Component>
    );
};

export default function SocialShare({ title }: { title: string }) {
    const [url, setUrl] = React.useState('');

    React.useEffect(() => {
        setUrl(window.location.href);
    }, []);

    if (!url) return null;

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-gray-700 mr-2 hidden sm:inline">แชร์</span>
            <SocialButton
                color="bg-[#06C755]"
                icon={<span className="font-bold text-sm">LINE</span>}
                href={`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}`}
                title="แชร์ผ่าน LINE"
            />
            <SocialButton
                color="bg-[#1877F2]"
                icon={<Facebook size={16} fill="white" />}
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                title="แชร์ผ่าน Facebook"
            />
        </div>
    );
}
