'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin, Loader2 } from 'lucide-react';
import { TrainingItem } from '@/types';

interface TrainingCalendarProps {
    initialTrainings: TrainingItem[];
}

export default function TrainingCalendar({ initialTrainings }: TrainingCalendarProps) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const thaiMonths = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const thaiYear = year + 543;

    // Filter trainings for the sidebar (current selected month)
    const currentMonthTrainings = initialTrainings.filter(item =>
        item.month === month && item.year === year
    );

    // Get trainings for a specific day to map onto the calendar
    const getTrainingsForDay = (day: number) => {
        const currentDateStr = new Date(year, month, day).getTime();
        return initialTrainings.filter(item => {
            const startDate = new Date(item.year, item.month, item.date).getTime();
            if (!item.endDate || item.endMonth === undefined || item.endMonth === null || !item.endYear) {
                return item.date === day && item.month === month && item.year === year;
            }
            const endDate = new Date(item.endYear, item.endMonth, item.endDate).getTime();
            return currentDateStr >= startDate && currentDateStr <= endDate;
        });
    };

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Calendar Section (Left - 2/3) */}
            <div className="flex-1 lg:w-2/3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Calendar Header */}
                    <div className="bg-red-600 p-6 text-white flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">{thaiMonths[month]} {thaiYear}</h2>
                            <p className="text-red-100 text-sm opacity-80">{thaiMonths[month]} {year}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handlePrevMonth} className="p-2 hover:bg-white/20 rounded-full transition"><ChevronLeft size={20} /></button>
                            <button onClick={handleNextMonth} className="p-2 hover:bg-white/20 rounded-full transition"><ChevronRight size={20} /></button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="p-6">
                        {/* Weekday Headers */}
                        <div className="grid grid-cols-7 mb-4 text-center">
                            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map((day, index) => (
                                <div key={index} className="text-gray-400 text-sm font-medium py-2">{day}</div>
                            ))}
                        </div>

                        {/* Days */}
                        <div className="grid grid-cols-7 gap-1 md:gap-2">
                            {/* Empty cells for padding */}
                            {Array.from({ length: firstDay }).map((_, index) => (
                                <div key={`empty-${index}`} className="aspect-square bg-gray-50 rounded-lg"></div>
                            ))}

                            {/* Day cells */}
                            {Array.from({ length: daysInMonth }).map((_, index) => {
                                const day = index + 1;
                                const dayTrainings = getTrainingsForDay(day);
                                const hasTraining = dayTrainings.length > 0;
                                const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

                                const cellContent = (
                                    <>
                                        <span className={`text-sm font-bold ${isToday ? 'text-red-600' : 'text-gray-700'}`}>{day}</span>

                                        {/* Training Indicator Dot */}
                                        {hasTraining && (
                                            <div className="w-full flex justify-end gap-1 mt-1">
                                                {dayTrainings.map((training) => (
                                                    <div
                                                        key={training.id}
                                                        className={`w-2.5 h-2.5 md:w-3.5 md:h-3.5 rounded-full shadow-sm ${training.type === 'Online' ? 'bg-red-500' :
                                                            training.type === 'Onsite' ? 'bg-green-500' : 'bg-blue-500'
                                                            }`}
                                                        title={training.title}
                                                    ></div>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                );

                                const commonClasses = `aspect-square rounded-lg border p-1 md:p-2 relative flex flex-col justify-between transition group
                                    ${isToday ? 'border-red-500 bg-red-50' : 'border-gray-100 hover:border-red-200 hover:shadow-sm'}
                                    ${hasTraining ? 'cursor-pointer hover:bg-red-50' : ''}
                                `;

                                if (hasTraining) {
                                    return (
                                        <Link
                                            key={day}
                                            href={`/trainings/${dayTrainings[0].id}`}
                                            className={commonClasses}
                                        >
                                            {cellContent}
                                        </Link>
                                    );
                                }

                                return (
                                    <div
                                        key={day}
                                        className={commonClasses}
                                    >
                                        {cellContent}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Section (Right - 1/3) */}
            <div className="lg:w-1/3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                    <div className="flex items-center gap-2 mb-6">
                        <CalendarIcon className="text-red-600" size={20} />
                        <h3 className="text-xl font-bold text-gray-800">หลักสูตรในเดือนนี้</h3>
                    </div>

                    {currentMonthTrainings.length > 0 ? (
                        <div className="space-y-4">
                            {currentMonthTrainings.map((item) => (
                                <Link key={item.id} href={`/trainings/${item.id}`} className="block group">
                                    <div className="border border-gray-100 rounded-lg p-4 hover:border-red-200 hover:bg-red-50 transition">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.type === 'Online' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                {item.type}
                                            </span>
                                            <span className="text-gray-400 text-xs flex items-center gap-1">
                                                <Clock size={12} /> {item.time}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-red-600 transition mb-2">
                                            {item.title}
                                        </h4>
                                        <div className="flex items-center text-xs text-gray-500 gap-2">
                                            <MapPin size={12} /> <span>{item.location}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-400">
                            <p>ไม่มีการอบรมในเดือนนี้</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
