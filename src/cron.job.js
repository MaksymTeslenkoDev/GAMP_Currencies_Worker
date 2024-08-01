'use strict';

class CronJob {
  constructor(name, application) {
    this.cronName = name;
    this.logger = application.logger;
    this.timeoutId = null;
  }

  logInfo(message) {
    this.logger.log(`${this.cronName}: ${message}`);
  }

  logDebug(message) {
    this.logger.debug(`${this.cronName}: ${message}`);
  }

  logError(message) {
    this.logger.error(`${this.cronName}: ${message}`);
  }

  start(timeout = 0, ...params) {
    if (!timeout) {
      this.logDebug('Start cron job');
      return this.init(...params);
    }

    clearTimeout(this.timeoutId);

    this.timeoutId = setTimeout(() => {
      this.logDebug('Start cron job');
      this.init(...params)
        .catch((err) => this.logError(err.toString(), err))
        .finally(() => this.start(timeout));
    }, timeout);
  }

  stop() {
    clearTimeout(this.timeoutId);
    this.logDebug('Stop job');
  }

  async init(params = {}) {}
}

module.exports = CronJob;