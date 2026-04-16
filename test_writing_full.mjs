import { chromium } from 'playwright-core';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Testing full page screenshot of writing.html...");
  await page.goto("http://127.0.0.1:8888/writing.html", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  console.log("URL: " + page.url());
  console.log("Title: " + await page.title());

  // Full page screenshot
  await page.screenshot({ path: "test_writing_full.png", fullPage: true });
  console.log("Full page screenshot saved");

  // Check article grid content
  const html = await page.locator("#article-grid").innerHTML().catch(() => "Not found");
  console.log("\nArticle grid HTML (first 500 chars):");
  console.log(html.substring(0, 500));

  await browser.close();
}

test().catch(console.error);
