const puppeteer = require('puppeteer');
const fs = require('fs');
// import writeFile from 'fs/promises'

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (request) => {
    if (['image', 'media', 'font'].indexOf(request.resourceType()) !== -1) {
      request.abort();
  } else {
      request.continue();
  }
  });
  for(let i =1; i<=31;i++ ){
    console.time(`day ${i}`)
    await takeInfo(page, i)
    console.timeEnd(`day ${i}`)
  }
  await page.waitForTimeout(10000)
  await browser.close();
})();

const takeInfo = async (page, day) => { 
  let date = `2020-1-${day}`
  console.log('taking info for', date)
  await page.goto(`https://www.wunderground.com/history/daily/KLGA/date/${date}`);
  await page.waitForSelector('tbody[role="rowgroup"]')
  let data = await page.$eval('tbody[role="rowgroup"]', el => el.innerText)
  data.replace(/\n/gm, `\t${day}\n`)
  console.log(data)
  data+='\n'
  await fs.appendFile('./data.csv', data, (err) => {
    console.log(err)
  })
}