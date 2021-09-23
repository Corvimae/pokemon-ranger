"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const routeList_1 = require("./routeList");
const ROUTE_LIST_UPDATE_INTERVAL = 1000 * 60 * 30;
const port = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next_1.default({ dev });
const handle = app.getRequestHandler();
app.prepare().then(async () => {
    try {
        const server = express_1.default();
        routeList_1.updateRouteList();
        setInterval(routeList_1.updateRouteList, ROUTE_LIST_UPDATE_INTERVAL);
        server.get('/api/routes', async (req, res) => {
            const routes = routeList_1.getRouteList();
            if (req.query.query) {
                res.json(routes.filter(item => {
                    const matchingValue = [
                        item.author,
                        item.game,
                        item.title,
                        item.path,
                    ].find(value => (value === null || value === void 0 ? void 0 : value.toLowerCase().indexOf(req.query.query)) !== -1);
                    return matchingValue !== undefined && matchingValue !== null;
                }));
            }
            else {
                res.json(routeList_1.getRouteList());
            }
        });
        server.get('*', (req, res) => handle(req, res));
        server.listen(3000, () => {
            console.info(`> Server listening on port ${port} (dev: ${dev})`);
        });
    }
    catch (e) {
        console.error('Unable to start server, exiting...');
        console.error(e);
        process.exit();
    }
});
//# sourceMappingURL=server.js.map