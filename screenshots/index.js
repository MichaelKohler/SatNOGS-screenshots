const fs = require('fs');
const puppeteer = require('puppeteer');

module.exports = async function(context, req) {
    const fromIndex = parseInt(req.query.from, 10);
    const toIndex = parseInt(req.query.to, 10);
    const browser = await puppeteer.launch({
      headless: true,
      defaultViewport: null,
      args: ['--start-maximized']
    });
    fs.mkdirSync('/tmp/satnogs-images');

    const screenshotBuffer = await screenshot(browser, 100);
    await browser.close();

    context.res = {
      body: screenshotBuffer,
      headers: {
        'content-type': 'image/png',
      },
    };
};

async function screenshot(browser, index) {
  const page = await browser.newPage();
  await page.goto(`https://network.satnogs.org/stations/${index}/`);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.setViewport({
    width: 1200,
    height: 800,
    deviceScaleFactor: 2,
  });
  const screenshotBuffer = await page.screenshot({
    path: `/tmp/satnogs-images/${getPaddedNumber(index)}.jpg`,
    type: 'jpeg',
  });
  await page.close();

  return screenshotBuffer;
}

function getPaddedNumber(index) {
  return ('0000' + index).substr(-4,4);
}
