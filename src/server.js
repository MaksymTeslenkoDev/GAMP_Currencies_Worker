const http = require('node:http');

class Server {
  constructor(app) {
    this.console = app.logger;
    this.workers = app.workers;
    this.config = app.config;
    this.httpServer = http.createServer();
  }

  initWorkers() {
    this.console.log('Init workers');
    this.workers.CurrenciesRatioWorker.start(
      this.config.timers.currenciesRatioTimer,
    );
  }

  destroyWorkers() {
    this.console.log('Destroy workers');
    this.workers.CurrenciesRatioWorker.stop();
  }

  listen() {
    this.httpServer.listen(this.config.port, () => {
      this.console.log(`Server started on port ${this.config.server.port}`);
    });
  }
}

module.exports = Server;
