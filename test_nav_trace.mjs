import { chromium } from 'playwright-core';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Testing navigation...");
  await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const result = await page.evaluate(async () => {
    const links = Array.from(document.querySelectorAll("a[href=\"writing.html\"]"));
    if (links.length === 0) return { error: "No links" };
    const link = links[0];
    const event = new MouseEvent("click", { bubbles: true, cancelable: true, view: window });
    link.dispatchEvent(event);
    await new Promise(r => setTimeout(r, 100));
    return {
      text: link.textContent.trim(),
      isActive: window.pageTransition?.isActive,
      destination: window.pageTransition?.destination
    };
  });

  console.log("After click:", result);
  await page.waitForTimeout(2000);
  const final = await page.evaluate(() => ({ url: window.location.href }));
  console.log("Final:", final);

  await browser.close();
}

test().catch(console.error);
