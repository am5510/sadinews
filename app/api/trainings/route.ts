import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const trainings = await prisma.training.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(trainings);
    } catch (error) {
        console.error('Error fetching trainings:', error);
        return NextResponse.json({ error: 'Failed to fetch trainings' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const training = await prisma.training.create({
            data: {
                title: body.title,
                date: parseInt(body.date) || 1,
                month: parseInt(body.month) || 0,
                year: parseInt(body.year) || new Date().getFullYear(),
                time: body.time,
                location: body.location,
                seats: parseInt(body.seats) || 0,
                available: parseInt(body.available) || parseInt(body.seats) || 0,
                price: body.price,
                type: body.type || 'Onsite',
                speaker: body.speaker,
                speakerImage: body.speakerImage,
                description: body.description,
            },
        });
        return NextResponse.json(training, { status: 201 });
    } catch (error) {
        console.error('Error creating training:', error);
        return NextResponse.json({ error: 'Failed to create training' }, { status: 500 });
    }
}
