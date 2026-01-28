import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const training = await prisma.training.findUnique({ where: { id } });
        if (!training) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(training);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch training' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const training = await prisma.training.update({
            where: { id },
            data: {
                title: body.title,
                date: body.date,
                month: body.month,
                year: body.year,
                time: body.time,
                location: body.location,
                seats: body.seats,
                available: body.available,
                price: body.price,
                type: body.type,
                speaker: body.speaker,
                speakerImage: body.speakerImage,
                description: body.description,
            },
        });
        return NextResponse.json(training);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update training' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.training.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting training:', error);
        return NextResponse.json({ error: 'Failed to delete training' }, { status: 500 });
    }
}
