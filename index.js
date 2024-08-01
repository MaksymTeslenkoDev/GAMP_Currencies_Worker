'use strict';

const { loadApplication } = require('./src/loader');
const path = require('node:path');
const APPLICATION_PATH = path.join(process.cwd(), '../GAMP_SERVERWORKER_EXAMPLE');
const LOG_FOLDER_PATH = path.join(process.cwd(), './log');
const logger = require('./src/logger.js')(LOG_FOLDER_PATH);
const Server = require('./src/server.js');

(async () => {
  const app = await loadApplication(APPLICATION_PATH, logger);
  app.server = new Server(app);
  try {
    app.server.listen();
    app.server.initWorkers();
  } catch (err) {
    logger.error(err);
    app.server.destroyWorkers();
    process.exit(1);
  }

  process.on('SIGINT', () => {
    logger.info('Process terminated by SIGINT');
    app.server.destroyWorkers();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    logger.info('Process terminated by SIGTERM');
    app.server.destroyWorkers();
    process.exit(0);
  });
})();
