import React from 'react';

export default function Footer({ logoUrl }: { logoUrl?: string | null }) {
    return (
        <footer className="bg-gray-900 text-gray-400 py-10 mt-10">
            <div className="container mx-auto px-4 max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 text-sm items-center">
                <div className="flex flex-row items-center gap-4">
                    {logoUrl ? (
                        <img src={logoUrl} alt="SadiNews Logo" className="h-[40px] w-auto object-contain brightness-0 invert opacity-80" />
                    ) : (
                        <div className="text-3xl tracking-tighter text-white flex items-center leading-none" style={{ fontFamily: "'Poppins', sans-serif" }}>
                            <span className="font-bold mr-1">Sadi</span><span className="font-light">News</span>
                        </div>
                    )}
                    <p className="text-gray-500 text-sm sm:text-base border-l border-gray-700 pl-4 py-1">สถาบันพัฒนาการตรวจเงินแผ่นดิน</p>
                </div>

            </div>
        </footer>
    );
}
