import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const connectionString = process.env.DATABASE_URL;

console.log('Loaded Environment Variables check:');
console.log('DATABASE_URL type:', typeof connectionString);
if (!connectionString) {
    console.error('ERROR: DATABASE_URL is not defined.');
    process.exit(1);
}

const prisma = new PrismaClient({
    log: ['info'],
});

async function main() {
    console.log('Testing Prisma Connection (Standard)...');
    try {
        // 1. Create
        console.log('Creating test news...');
        const news = await prisma.news.create({
            data: {
                title: 'Test News Title Standard',
                category: 'Testing',
                image: 'https://example.com/test.jpg',
                content: 'This is a test news item via standard client.',
                time: 'Now',
            },
        });
        console.log('Created news:', news.id);

        // 2. Read
        console.log('Reading news...');
        const allNews = await prisma.news.findMany();
        console.log('Total news count:', allNews.length);

        // 3. Delete
        await prisma.news.delete({ where: { id: news.id } });
        console.log('Deleted news:', news.id);

        console.log('Database Operations Verification: SUCCESS');
    } catch (error) {
        console.error('Database Operations Verification: FAILED', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
