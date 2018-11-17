
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
}, 60000);

beforeEach(async (done) => {
  page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  await page.goto('http://localhost:4200/');
  screenshot(page, 'pre-loading');
  await page.waitFor(4000);
  screenshot(page, 'after-loading');
  await pfund;

  done();
}, 60000);

afterEach(async (done) => {
  page.close();
  done();
});

test('Should approve basalt contract expend tokens', async () => {
  const profileButton = (await page.$x('//*[@id="mat-checkbox-1"]/label/div/div[1]'))[0];
  await page.waitFor(300);
  await profileButton.click();
  await page.waitFor(1000);
  screenshot(page, 'pre-approve-basalt');
  const checkapprove = (await page.$x('//*[@id="mat-checkbox-1"]/label/div'))[0];
  await checkapprove.click();
  await page.waitFor(1000);
  await metamask.confirmTransaction();
  const checkbox = (await page.$x('//*[@id="mat-checkbox-1-input"]'))[0];
  screenshot(page, 'post-approve-basalt');
  expect(await (await checkbox.getProperty('checked')).jsonValue()).toBe(true);
}, 120000);

test('Should remove approve basalt contract expend tokens', async () => {
  const profileButton = (await page.$x('//*[@id="navbar"]/div/div/div/div/div[2]/div[5]/div'))[0];
  await page.waitFor(300);
  await profileButton.click();
  await page.waitFor(1000);
  screenshot(page, 'pre-remove-approve-basalt');
  const checkapprove = (await page.$x('//*[@id="mat-checkbox-1"]/label/div'))[0];
  const checkbox = (await page.$x('//*[@id="mat-checkbox-1-input"]'))[0];
  expect(await (await checkbox.getProperty('checked')).jsonValue()).toBe(true);
  await checkapprove.click();
  await page.waitFor(1000);
  await metamask.confirmTransaction();
  screenshot(page, 'post-remove-approve-basalt');
  expect(await (await checkbox.getProperty('checked')).jsonValue()).toBe(false);
}, 120000);

afterAll(async () => {
  browser.close();
});
