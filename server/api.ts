import express from 'express';
import cors from 'cors';
import { getRouteList, getRouteMetadata, groupRoutesByTitle } from './routeList';

const apiRouter = express.Router();

apiRouter.use(cors());

apiRouter.get('/route/:path', async (req, res) => {
  const route = getRouteMetadata(req.params.path);

  if (route) {
    res.json(route);
  } else {
    res.status(404).json('Route does not exist.');
  }
});

apiRouter.get('/routes', async (req, res) => {
  const routes = getRouteList();

  if (req.query.query) {
    const matchingRoutes = routes.filter(item => {
      const matchingValue = [
        item.author,
        item.game,
        item.title,
        item.path,
      ].find(value => JSON.stringify(value).toLowerCase().indexOf(req.query.query as string) !== -1);

      return matchingValue !== undefined && matchingValue !== null;
    });
    
    res.json(groupRoutesByTitle(matchingRoutes));
  } else {
    res.json(groupRoutesByTitle(getRouteList()));
  }
});

export default apiRouter;
