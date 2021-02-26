const puppeteer = require('puppeteer')
const fs = require('fs')
const str = 'Time\tTemperature\tDew Point\tHumidity\tWind\tWind Speed\tWind Gust\tPressure\tPreciptation\tCondition\tday\n'


/**
 * @description main arrow function that prepares the ambient
 */
;(async () => {
  console.time('inicio')
  
  // launches the browser and configure it to not download any media, making the navigation faster 
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.setDefaultTimeout(180000)
  await page.setRequestInterception(true)
  page.on('request', (request) => {
    if (['image', 'media', 'font'].indexOf(request.resourceType()) !== -1) {
      request.abort()
  } else {
      request.continue()
  }
  })
  
  //starts a file to store data
  await fs.writeFile('./data.csv', str, (err) => {
    console.log(err)
  })
  let date = new Date('2020-1-1') //setting 2020-01-01 as the first day to be collected
  let strDate = ''
  
  // iteracts throught the days of the year  
  for(let i =1; i<=365; i++ ){
    console.time(`day ${i}`)
    console.log(`iniciando busca por ${date.toDateString()}`)
    strDate = date.toLocaleDateString().replace(/\//g,'-')
    await takeInfo(page, i, strDate)
    date.setDate(date.getDate() + 1 )
    console.timeEnd(`day ${i}`)
  }
  await page.waitForTimeout(10000)
  await browser.close()
  console.timeEnd('inicio')
})()

/**
 * @description goes to the webpage and extract the data to store on a csv file
 * @param {puppeteer.browser.page} page 
 * @param {number} day 
 * @param {string} strDate 
 */
const takeInfo = async (page, day, strDate) => { 
  try {
    await page.goto(`https://www.wunderground.com/history/daily/KLGA/date/${strDate}`)
    await page.waitForSelector('tbody[role="rowgroup"]')
    let data = await page.$eval('tbody[role="rowgroup"]', el => el.innerText)
    data+='\n'
    data = data.replace(/\n/g, `\t${day}\n`)
    console.log(data)
    await fs.appendFile('./data.csv', data, (err) => {
      console.log(err)
    })
  } catch (error) {
    console.error(error)
    console.log('could not take data for day', strDate)
  }
}