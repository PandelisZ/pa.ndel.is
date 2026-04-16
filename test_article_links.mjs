import { chromium } from 'playwright-core';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Testing article detail navigation...");
  await page.goto("http://127.0.0.1:8888/writing.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Find an article link
  const articleLink = await page.locator(".article-title a").first();
  const href = await articleLink.getAttribute("href");
  console.log("First article link href: " + href);

  // Check if it has data-internal-link
  const hasAttr = await articleLink.evaluate(el => el.hasAttribute("data-internal-link"));
  console.log("Has data-internal-link: " + hasAttr);

  await browser.close();
}

test().catch(console.error);
