import express from 'express';
import next from 'next';
import dotenv from 'dotenv';
// import fetch from 'isomorphic-fetch';

dotenv.config();

const port = parseInt(process.env.PORT ?? '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  try {
    const server = express();

    server.get('/api/routes', async (req, res) => {
      res.json({});
    });
    
    server.get('*', (req, res) => handle(req, res));

    server.listen(3000, (): void => {
      // eslint-disable-next-line no-console
      console.log(`> Server listening on port ${port} (dev: ${dev})`);
    });
  } catch (e) {
    console.error('Unable to start server, exiting...');
    console.error(e);
    process.exit();
  }
});
