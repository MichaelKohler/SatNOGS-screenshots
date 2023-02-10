const fs = require('fs');
const archiver = require('archiver');
const puppeteer = require('puppeteer');

const SCREENSHOTS_PATH = '/tmp/satnogs-images';
const ZIP_OUTPUT_FILE = '/tmp/screenshots.zip';

module.exports = async function(context, req) {
  const fromIndex = parseInt(req.query.from, 10);
  const toIndex = parseInt(req.query.to, 10);

  if (typeof fromIndex !== 'number' || typeof toIndex !== 'number') {
    context.res = {
      body: 'to and from parameters required and needs to be a number!',
    };

    return;
  }

  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  try {
    await fs.promises.mkdir(SCREENSHOTS_PATH);
  } catch (error) {
    // ignore..
  }

  for (let index = fromIndex; index <= toIndex; index++) {
    console.log(`=== Creating screenshot for ${index} ===`);
    await screenshot(browser, index);
  }

  console.log("Closing browser..");
  await browser.close();

  const buffer = await createZip();

  console.log("Setting response buffer..");
  context.res = {
    body: buffer,
    headers: {
      'content-type': 'application/zip',
      'content-disposition': 'attachment; filename="screenshots.zip"',
    },
  };
};

async function screenshot(browser, index) {
  const url = `https://network.satnogs.org/stations/${index}/`;
  console.log(`Opening browser and navigating to ${url}..`);
  const page = await browser.newPage();
  await page.goto(url);
  await new Promise((resolve) => setTimeout(resolve, 3000));
  console.log("Setting viewport..");
  await page.setViewport({
    width: 1200,
    height: 800,
    deviceScaleFactor: 2,
  });
  console.log("Taking screenshot..");
  await page.screenshot({
    path: `${SCREENSHOTS_PATH}/${getPaddedNumber(index)}.jpg`,
    type: 'jpeg',
  });
  console.log("Closing page..");
  await page.close();
}

function getPaddedNumber(index) {
  return ('0000' + index).substr(-4,4);
}

function createZip() {
  console.log('Creating zip archive..');

  const output = fs.createWriteStream(ZIP_OUTPUT_FILE);
  const archive = archiver('zip', {
    zlib: { level: 9 },
  });

  output.on('end', () => {
    console.log('Data has been drained');
  });

  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.log(err);
      return;
    }

    throw err;
  });

  archive.on('error', (err) => {
    throw err;
  });

  archive.pipe(output);
  archive.directory(SCREENSHOTS_PATH, false);
  archive.finalize();

  return new Promise((resolve) => {
    output.on('close', async () => {
      console.log(archive.pointer() + ' total bytes');
      console.log('archiver has been finalized and the output file descriptor has closed.');

      const stats = await fs.promises.stat(ZIP_OUTPUT_FILE);
      console.log(`Zip Archive: ${stats.size} bytes`);
      const rawFile = await fs.promises.readFile(ZIP_OUTPUT_FILE);
      const buffer = Buffer.from(rawFile, 'base64');
      resolve(buffer);
    });
  });
}
