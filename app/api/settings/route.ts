import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const settings = await prisma.siteSetting.findUnique({
            where: { id: "1" },
        });
        return NextResponse.json(settings || { logo: null });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { logo } = await req.json();

        const settings = await prisma.siteSetting.upsert({
            where: { id: "1" },
            update: { logo },
            create: { id: "1", logo },
        });

        return NextResponse.json(settings);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
