const { Queue } = require('bullmq');
const Redis = require('ioredis');

async function checkWorkers() {
  const connection = new Redis({ host: 'localhost', port: 6379 });
  const queue = new Queue('evaluationQueue', { connection });

  const workers = await queue.getWorkers();
  console.log('Workers connected to evaluationQueue:');
  console.log(workers);

  process.exit(0);
}

checkWorkers();
