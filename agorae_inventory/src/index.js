/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import cluster from 'node:cluster';
import os from 'os';
import process from 'node:process';

// Get the directory path of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the .env file
dotenv.config({ path: `${__dirname}/.env` });

import cors from 'cors';

import routes from './routes/index.js';
import database from './config/database.js';
import {
  appErrorHandler,
  genericErrorHandler,
  notFound
} from './middlewares/error.middleware.js';

import {
  createStaticInventoryCategory,
  createStaticInventoryUnit,
  createStaticGstFeed,
  createPaymentMode,
  createChequeStatus
} from './utils/dataFeed.util.js';

const host = process.env.APP_HOST;
const port = process.env.APP_PORT;
const api_version = process.env.API_VERSION;

let totalCpu = os.cpus().length;
if (cluster.isPrimary) {
  console.log(`Primary ${process.pid} is running`);
  for (let i = 0; i < totalCpu; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  app.use(cors());

  app.use(express.urlencoded({ extended: true }));

  app.use('/public', express.static(path.resolve(__dirname, 'public')));
  app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

  // parse requests of content-type - application/json
  app.use(bodyParser.json());

  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));

  // Middleware to parse JSON data from requests
  app.use(express.json());

  database();
  app.use(`/api/${api_version}`, routes());
  app.use(appErrorHandler);
  app.use(genericErrorHandler);
  app.use(notFound);

  // Functions to feed static data in master.
  (async function () {
    await createStaticInventoryCategory();
    await createStaticInventoryUnit();
    await createStaticGstFeed();
    await createPaymentMode();
    await createChequeStatus();
  })();

  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
    console.log(`Server started at ${host}:${port}/api/${api_version}/`);
  });
  console.log(`Worker ${process.pid} started`);
  server.timeout = 300000;
}
