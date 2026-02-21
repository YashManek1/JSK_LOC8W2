import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.shortlistEntry.count();
        console.log('DB Connection OK. Entry count:', count);
        const config = await prisma.roundConfig.findFirst();
        console.log('Config OK:', config);
    } catch (e) {
        console.error('DATABASE ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
