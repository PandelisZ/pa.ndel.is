import { chromium } from 'playwright-core';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Testing navigation...");
  await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  console.log("Home loaded: " + page.url());

  console.log("Dispatching click via page.evaluate...");
  await page.evaluate(async () => {
    const link = document.querySelector("a[href=\"writing.html\"]");
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
    link.dispatchEvent(event);
  });

  console.log("Click dispatched, waiting...");
  await page.waitForTimeout(3000);
  console.log("After wait, URL: " + page.url());

  await browser.close();
}

test().catch(e => {
  console.error("Error:", e.message);
  process.exit(1);
});
