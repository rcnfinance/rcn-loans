import fs = require('fs');

let sessionId: string;
let imgNonce = 0;

export function delay(timeout) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });
}

export async function screenshot(page, prefix) {
  if (!fs.existsSync('./screenshots/')) {
    fs.mkdirSync('./screenshots/');
  }

  if (!sessionId) {
    sessionId = (new Date().getTime() / 1000).toFixed(0).toString();
  }

  await page.screenshot({ path: './screenshots/' + prefix + '-' + sessionId + '-' + imgNonce++ + '.png', fullPage: false });
}
