import { readFileSync } from 'fs';
import { buildRouteProcessor } from '../utils/routeProcessor';

if (process.argv.length < 3) {
  console.error('Filename argument is required');
  process.exit(1);
}

const routefile = readFileSync(process.argv[2]).toString();

try {
  buildRouteProcessor(false).processSync(routefile);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  console.info('Routefile successfuly compiled.');
  process.exit(0);
} catch (e) {
  console.error('Routefile failed validation:');
  console.error(e);
  process.exit(1);
}
