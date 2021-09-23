"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const next_1 = __importDefault(require("next"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = parseInt((_a = process.env.PORT) !== null && _a !== void 0 ? _a : '3000', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = next_1.default({ dev });
const handle = app.getRequestHandler();
app.prepare().then(async () => {
    try {
        const server = express_1.default();
        server.get('/api/routes', async (req, res) => {
            res.json({});
        });
        server.get('*', (req, res) => handle(req, res));
        server.listen(3000, () => {
            // eslint-disable-next-line no-console
            console.log(`> Server listening on port ${port} (dev: ${dev})`);
        });
    }
    catch (e) {
        console.error('Unable to start server, exiting...');
        console.error(e);
        process.exit();
    }
});
//# sourceMappingURL=server.js.map