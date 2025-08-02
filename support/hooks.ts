import { Before, After, setDefaultTimeout } from '@cucumber/cucumber';
import { chromium, Browser, Page } from 'playwright';
import * as dotenv from 'dotenv';
dotenv.config();


setDefaultTimeout(30 * 1000); // Increase default timeout

let browser: Browser;
export let page: Page;
const isHeadless = process.env.HEADLESS !== 'false';

Before(async () => {
  browser = await chromium.launch({
  headless: isHeadless,
  slowMo: isHeadless ? 0 : 100
});
  const context = await browser.newContext();
  page = await context.newPage();
});

After(async () => {
  await page.close();
  await browser.close();
});
