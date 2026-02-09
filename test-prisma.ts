
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Checking if isVisible field exists in schema...');

        // Create a dummy news item
        const news = await prisma.news.create({
            data: {
                title: 'Test Visibility',
                category: 'Test',
                isVisible: false // Explicitly setting false to test
            }
        });

        console.log('Created news item:', news);

        if (news.isVisible === false) {
            console.log('SUCCESS: isVisible field is working correctly.');
        } else {
            console.error('FAILURE: isVisible field returned unexpected value:', news.isVisible);
        }

        // Clean up
        await prisma.news.delete({ where: { id: news.id } });

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
