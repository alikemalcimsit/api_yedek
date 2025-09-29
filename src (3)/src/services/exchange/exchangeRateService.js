// services/exchangeRateService.js
import axios from 'axios';
import xml2js from 'xml2js';
async function getExchangeRates() {
  try {
    const response = await axios.get('https://www.tcmb.gov.tr/kurlar/today.xml');
    const xml = response.data;

    return await new Promise((resolve, reject) => {
      xml2js.parseString(xml, { explicitArray: false }, (err, result) => {
        if (err) return reject('XML parsing error');

        const currencies = result.Tarih_Date.Currency;
        const usd = currencies.find(c => c.$.Kod === 'USD')?.ForexSelling || '0';
        const eur = currencies.find(c => c.$.Kod === 'EUR')?.ForexSelling || '0';

        resolve({
          USD: parseFloat(usd.replace(',', '.')),
          EUR: parseFloat(eur.replace(',', '.')),
        });
      });
    });
  } catch (err) {
    throw new Error('TCMB verisi alınamadı');
  }
}

export {
  getExchangeRates
};
