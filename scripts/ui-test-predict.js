const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const base = 'http://localhost:5177';

  try {
    await page.goto(base, { waitUntil: 'networkidle2', timeout: 30000 });

    // set guest token so Dashboard doesn't redirect to login
    await page.evaluate(() => {
      localStorage.setItem('guest', 'true');
    });

    await page.goto(base + '/dashboard/materials/nylon-6', { waitUntil: 'networkidle2', timeout: 30000 });

    await page.waitForSelector('.predict-btn', { timeout: 10000 });
    await page.click('.predict-btn');

    await page.waitForSelector('.modal', { timeout: 10000 });

    // Click "Input Parameters" (second option)
    await page.waitForSelector('.choose-grid .option', { timeout: 5000 });
    const opts = await page.$$('.choose-grid .option');
    if (opts && opts.length >= 2) {
      await opts[1].click();
    } else {
      const [btn] = await page.$x("//button[contains(., 'Input Parameters')]");
      if (btn) await btn.click();
    }

    // Fill target diameter
    const elems = await page.$x("//label[contains(., 'Target Diameter')]/input");
    if (!elems || elems.length === 0) {
      console.error('Target input not found');
      await page.screenshot({ path: 'frontend/test/nylon6-predict-fail.png' });
      await browser.close();
      process.exit(2);
    }
    const input = elems[0];
    await input.click({ clickCount: 3 });
    await input.type('900');

    // Click Calculate Parameters
    const [calcBtn] = await page.$x("//button[contains(., 'Calculate Parameters')]");
    if (calcBtn) {
      await calcBtn.click();
    } else {
      // fallback
      await page.click('button.run');
    }

    // Wait for either computed params or predictions to appear
    try {
      await page.waitForXPath("//h4[contains(., 'Estimated Input Parameters') or contains(., 'Top')]", { timeout: 8000 });
    } catch (e) {
      // ignore
    }

    // Capture screenshot of modal area
    const modal = await page.$('.modal');
    if (modal) {
      await modal.screenshot({ path: 'frontend/test/nylon6-predict.png' });
      console.log('screenshot saved: frontend/test/nylon6-predict.png');
    } else {
      await page.screenshot({ path: 'frontend/test/nylon6-predict-full.png', fullPage: true });
      console.log('modal not found; full page screenshot saved: frontend/test/nylon6-predict-full.png');
    }

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    await page.screenshot({ path: 'frontend/test/nylon6-predict-error.png', fullPage: true }).catch(() => {});
    await browser.close();
    process.exit(1);
  }
})();
