
import 'jest';

import { TestWallet } from './utils/test-wallet';
import { screenshot } from './utils/test-utils';

const puppeteer = require('puppeteer');
const dappeteer = require('dappeteer');

let page;
let browser;
let metamask;
let wallet;
let pfund;

beforeAll(async (done) => {
  wallet = new TestWallet();
  pfund = wallet.fund();
  browser = await dappeteer.launch(puppeteer, { args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  metamask = await dappeteer.getMetamask(browser);
  await metamask.importAccount(wallet.mnemonic);
  await metamask.switchNetwork('ropsten');
  done();
}, 120000);

beforeEach(async (done) => {
  page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  await page.goto('http://localhost:4200/');
  await screenshot(page, 'pre-loading');
  await page.waitFor(4000);
  await screenshot(page, 'after-loading');
  await pfund;

  done();
}, 120000);

afterEach(async (done) => {
  page.close();
  done();
});

test('Should approve basalt contract expend tokens', async () => {
  // Open profile
  const profileButton = (await page.$x('//*[@id="navbar"]/div/div/div/div/div[2]/div[5]/div/div[2]'))[0];
  await page.waitFor(3000);
  await profileButton.click();

  // Wait profile opening
  await page.waitFor(1000);
  await screenshot(page, 'pre-approve-basalt');

  // Click approve
  const checkapprove = (await page.$x('//*[@id="mat-checkbox-1"]/label/div'))[0];
  await checkapprove.click();
  await page.waitFor(3000);

  // Confirm transaction
  await metamask.confirmTransaction();
  await page.waitFor(3000);

  // Check if transaction was confirmed
  const checkbox = (await page.$x('//*[@id="mat-checkbox-1-input"]'))[0];
  await screenshot(page, 'post-approve-basalt');
  expect(await (await checkbox.getProperty('checked')).jsonValue()).toBe(true);
  await page.waitFor(3000);
}, 120000);

test('Should remove approve basalt contract expend tokens', async () => {
  // Open profile
  const profileButton = (await page.$x('//*[@id="navbar"]/div/div/div/div/div[2]/div[5]/div'))[0];
  await page.waitFor(3000);
  await profileButton.click();
  await page.waitFor(3000);

  // Check if basalt is approved and uncheck
  await screenshot(page, 'pre-remove-approve-basalt');
  const checkapprove = (await page.$x('//*[@id="mat-checkbox-1"]/label/div'))[0];
  const checkbox = (await page.$x('//*[@id="mat-checkbox-1-input"]'))[0];
  expect(await (await checkbox.getProperty('checked')).jsonValue()).toBe(true);
  await checkapprove.click();

  // Confirm transaction
  await page.waitFor(3000);
  await metamask.confirmTransaction();

  // Check if transaction changed the checkbox
  await page.waitFor(3000);
  await screenshot(page, 'post-remove-approve-basalt');
  expect(await (await checkbox.getProperty('checked')).jsonValue()).toBe(false);
}, 120000);

afterAll(async () => {
  await wallet.destroy();
  browser.close();
}, 120000);
