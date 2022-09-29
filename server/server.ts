import express from 'express';
import next from 'next';
import { updateRouteList } from './routeList';
import apiRouter from './api';

const ROUTE_LIST_UPDATE_INTERVAL = 1000 * 60 * 30;
const port = parseInt(process.env.PORT ?? '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  try {
    const server = express();

    updateRouteList();

    setInterval(updateRouteList, ROUTE_LIST_UPDATE_INTERVAL);
    
    server.use('/api', apiRouter);
    
    server.get('*', (req, res) => handle(req, res));

    server.listen(3000, (): void => {
      console.info(`> Server listening on port ${port} (dev: ${dev})`);
    });
  } catch (e) {
    console.error('Unable to start server, exiting...');
    console.error(e);
    process.exit();
  }
});
