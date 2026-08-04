import { chromium } from "/Users/wangzirui/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:4173", { waitUntil: "networkidle" });
await page.screenshot({ path: "/tmp/freecad-data-platform.png", fullPage: true });
console.log(await page.title());
console.log(await page.locator(".metric").allTextContents());
await page.locator('.nav[data-view="entry"]').click();
console.log("entry-visible", await page.locator("#entry").isVisible());
await page.locator('.nav[data-view="report"]').click();
console.log("report-visible", await page.locator("#reportBody").isVisible());
await browser.close();
