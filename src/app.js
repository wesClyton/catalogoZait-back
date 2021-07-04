import express from 'express';
import path from 'path';
import routes from './routes.js';
import cors from 'cors';

import './database/index.js';

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
      express.static('public')
    );
  }

  routes() {
    this.server.use(routes);
  }
}

export default new App().server;
