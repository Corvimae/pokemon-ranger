import express from 'express';
import next from 'next';
import { getRouteList, groupRoutesByTitle, updateRouteList } from './routeList';

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

    server.get('/api/routes', async (req, res) => {
      const routes = getRouteList();

      if (req.query.query) {
        const matchingRoutes = routes.filter(item => {
          const matchingValue = [
            item.author,
            item.game,
            item.title,
            item.path,
          ].find(value => value?.toLowerCase().indexOf(req.query.query as string) !== -1);

          return matchingValue !== undefined && matchingValue !== null;
        });
        
        res.json(groupRoutesByTitle(matchingRoutes));
      } else {
        res.json(groupRoutesByTitle(getRouteList()));
      }
    });
    
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
