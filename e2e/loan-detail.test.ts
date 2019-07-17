// tslint:disable:max-line-length

import 'jest';

import { screenshot } from './utils/test-utils';

const puppeteer = require('puppeteer');
const dappeteer = require('dappeteer');

let browser;

beforeAll(async (done) => {
  browser = await dappeteer.launch(puppeteer, { args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  done();
}, 60000);

test('Shoud navigate to detail', async () => {
  const page = await browser.newPage();
  await page.goto('http://localhost:4200/address/0x791bcc53d4adbfeb6f471f6241262b9a9021ea3f');
  await page.waitFor(1000);
  await screenshot(page, 'lender-page');
  await page.$eval(
    '#page-content-wrapper > app-address > div > div:nth-child(2) > div > app-loan-card > div > div > app-detail-button > a',
    e => e.click()
  );
  await page.waitFor(1000);
  expect(await page.evaluate(() => location.href)).toBe('http://localhost:4200/loan/2');
  await page.close();
}, 60000);

test('Should display detail of loan', async () => {
  // Open profile
  const page = await browser.newPage({ width: 1366, height: 768 });

  await page.goto('http://localhost:4200/loan/2');
  await page.waitFor(3000);

  await screenshot(page, 'loan-2-detail');

  // Should display paid status
  const statusText = await page.$eval(
    '#page-content-wrapper > app-loan-detail > div > div.loan-description.flex-container > div.left > div.avatar-information > div:nth-child(2) > app-avatar-title > div > div.txt-container.flex-item > div.title.ellipsis',
    e => e.innerText
  );
  expect(statusText).toBe('Paid');

  // Should display lent 400
  const lentText = await page.$eval(
    '#page-content-wrapper > app-loan-detail > div > div.loan-description.flex-container > div.left > div:nth-child(2) > app-conversion-graphic > app-body-list > div > div:nth-child(1)',
    e => e.innerText
  );
  expect(lentText).toBe('4000');

  // Should display paid ammount
  const paidText = await page.$eval(
    '#page-content-wrapper > app-loan-detail > div > div.loan-description.flex-container > div.left > div:nth-child(3) > app-conversion-graphic > app-body-list > div > div:nth-child(1)',
    e => e.innerText
  );

  expect(paidText).toBe('4085.07');

  // Should contain lender address
  const lenderText = await page.$eval(
    '#page-content-wrapper > app-loan-detail > div > div.loan-description.flex-container > div.left > div:nth-child(7)',
    e => e.innerText
  );

  expect(lenderText).toContain('0x791bcc53d4adbfeb6f471f6241262b9a9021ea3f');

  await page.close();
}, 60000);

afterAll(async () => {
  browser.close();
}, 60000);
