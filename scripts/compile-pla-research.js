/* eslint-disable */

// Ignore in browser contexts.
if (global.window) return;

const fs = require('fs');
const path = require('path');

const filename = process.argv[2];

const input = fs.readFileSync(filename).toString();

const segments = input.split('\n').slice(1).reduce((acc, line) => {
  const [id, name, task, val1, val2, val3, val4, val5, isBoosted] = line.split(',');

  const lastBlock = name ? {
    id: Number(id),
    name,
    tasks: [],
  } : acc[acc.length - 1];

  lastBlock.tasks.push({
    name: task,
    values: [val1, val2, val3, val4, val5].filter(value => value?.length > 0 ?? false).map(Number),
    isBoosted: isBoosted?.toLowerCase().trim() === 'true',
  });

  if (name) {
    return [...acc, lastBlock];
  }

  return acc;
}, []);

fs.writeFileSync(path.join(__dirname, '..', 'public', 'reference', 'pla-research.json'), JSON.stringify(segments, undefined, 2));
