const fs = require('fs/promises');

async function test() {
  try {
    const path =
      'C:\\Hackathons\\LOC\\Code\\LOC_PREP\\backend\\uploads\\1771748494329-800684119.pptx';
    const buf = await fs.readFile(path);
    console.log('Successfully read file, size:', buf.length);
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

test();
