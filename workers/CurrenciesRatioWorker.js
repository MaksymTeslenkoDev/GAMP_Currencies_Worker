const CronJob = require('../src/cron.job');
const { randomUUID } = require('node:crypto');

class CurrenciesRatioWorker extends CronJob {
  constructor(app) {
    super('CurrenciesRatioWorker', app);
    this.config = app.config;
  }

  async getRatio(currency) {
    const url =
      'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json';
    const response = await fetch(url);
    const data = await response.json();
    const currencyData = data.find((item) => item.cc === currency);
    if (!currencyData) {
      throw new Error(`Currency ${currency} not found`);
    }
    return currencyData;
  }

  async init() {
    this.logInfo('Start CurrenciesRatioWorker');

    try {
      const usd = await this.getRatio('USD');
      const eur = await this.getRatio('EUR');
      const usdToUah = usd.rate;
      const eurToUah = eur.rate;

      const data = {
        client_id: randomUUID(),
        events: [
          {
            name: `currency_ratio_usd`,
            params: {
              currency: 'USD',
              rate: usdToUah,
            },
          },
          {
            name: `currency_ratio_eur`,
            params: {
              currency: 'EUR',
              rate: eurToUah,
            },
          }
        ],
      };

      const url = `https://www.google-analytics.com/mp/collect?measurement_id=${this.config.gamp.MEASUREMENT_ID}&api_secret=${this.config.gamp.GAMP_SECRET}`;

      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        this.logError(
          `Failed to send data to Google Analytics: ${response.statusText}`,
        );
      }

      this.logInfo('Currencies ratio sent to Google Analytics');
    } catch (err) {
      this.logError(err.message);
    }
  }
}
module.exports = (app) => new CurrenciesRatioWorker(app);
