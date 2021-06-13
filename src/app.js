import express from 'express';
import path from 'path';
import routes from './routes.js';
import cors from 'cors';

import './database/index.js';

const __dirname = path.resolve(path.dirname(''));
const resolve = path.resolve;

class App {
  constructor() {
    this.server = express();
    this.server.use(cors());
    this.middlewares();
    this.routes();
  }

  middlewares() {
    this.server.use(express.json());

    this.server.use(
      '/capas', express.static(path.resolve(__dirname, '..', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
