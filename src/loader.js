'use strict';

const fsp = require('node:fs').promises;
const path = require('node:path');

const loadDir = async (dir, sandbox, contextualise = false) => {
  const files = await fsp.readdir(dir, { withFileTypes: true });
  const container = {};
  for (const file of files) {
    const { name } = file;
    if (file.isFile() && !name.endsWith('.js')) continue;
    const location = path.join(dir, name);
    const key = path.basename(name, '.js');
    container[key] = contextualise
      ? require(location)(sandbox)
      : require(location);
  }
  return container;
};

const loadApplication = async (appPath, logger) => {
  const sandbox = {
    logger: Object.freeze(logger),
  };

  // config
  const configPath = path.join(appPath, './config');
  const config = await loadDir(configPath, sandbox);
  sandbox.config = Object.freeze(config);

  const workersPath = path.join(appPath, './workers');
  const workers = await loadDir(workersPath, sandbox, true);
  sandbox.workers = Object.freeze(workers);

  Object.assign(sandbox, { path: appPath });
  return sandbox;
};

module.exports = {
  loadDir,
  loadApplication,
};
