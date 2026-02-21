import { PrismaClient } from '@prisma/client';
import { Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
    const prisma = new PrismaClient();
    const redis = new Redis(process.env.REDIS_URL as string);
     const queue = new Queue('shortlistQueue', { connection: redis });

    console.log('Resetting PROCESSING to PENDING...');
    const res = await prisma.shortlistEntry.updateMany({
        where: { status: 'PROCESSING' },
        data: { status: 'PENDING' },
    });
    console.log(`Updated ${res.count} entries in DB.`);

    console.log('Clearing BullMQ...');
    await queue.obliterate({ force: true });
    console.log('Queue wiped.');

    await prisma.$disconnect();
    redis.disconnect();
}

main().catch(console.error);
