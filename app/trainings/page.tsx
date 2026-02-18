import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import TrainingCalendar from './TrainingCalendar';
import { TrainingItem } from '@/types';

export const revalidate = 60;

export default async function TrainingsPage() {
    const trainings = await prisma.training.findMany({
        orderBy: { date: 'asc' }, // Or whatever order fits best
    });

    // Serialize dates if necessary (though they seem to be strings/ints in the schema)
    // Looking at schema: date, month, year are Ints. time is String. createdAt is DateTime.
    // We should ensure createdAt is serialized if used, or just pass as is if Client Component handles it.
    // The Client Component likely expects TrainingItem which usually has createdAt as string or Date.
    // Let's assume we map it to match the type expected by Client Component.

    const initialTrainings = trainings.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString()
    })) as unknown as TrainingItem[];

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">

            <main className="flex-1 container mx-auto px-4 max-w-7xl py-8 animate-fade-in">
                {/* Breadcrumb / Title */}
                <div className="flex items-center gap-2 mb-6 text-sm text-gray-500">
                    <Link href="/" className="hover:text-red-600">หน้าแรก</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-bold">ปฏิทินการจัดอบรม</span>
                </div>

                <TrainingCalendar initialTrainings={initialTrainings} />
            </main>

        </div>
    );
}
