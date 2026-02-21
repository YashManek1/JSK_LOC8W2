import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Hackathon Config and Team Apollo...');

    const config = await prisma.roundConfig.upsert({
        where: { id: 'seed-test-config' },
        update: {},
        create: {
            id: 'seed-test-config',
            maxSlides: 15,
            targetShortlist: 10,
            domains: ['GenAI', 'FinTech'],
            keywords: ['NextJS', 'PostgreSQL', 'AI'],
            problemStatement: 'Build an AI-powered judging platform that analyzes codebases using Groq and Octokit to verify hackathon submissions.',
            scoringWeights: {
                problemRelevance: 25, innovation: 25, technicalDepth: 20, marketImpact: 15, slideQuality: 15
            }
        }
    });

    const apollo = await prisma.shortlistEntry.upsert({
        where: { id: 'apollo-seed-id' },
        update: {
            teamName: 'Apollo'
        },
        create: {
            id: 'apollo-seed-id',
            configId: config.id,
            teamName: 'Apollo',
        }
    });

    console.log(`✅ Seeded Team Apollo! You can now visit /cockpit/Apollo on your frontend to test the GitHub AI Scanner.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
