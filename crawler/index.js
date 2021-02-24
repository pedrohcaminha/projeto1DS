const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.wunderground.com/history/daily/KLGA/date/2020-1-1');
  await page.screenshot({ path: './example.png' });

  await browser.close();
})();