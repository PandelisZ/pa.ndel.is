import { chromium } from 'playwright-core';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Testing article detail page...");
  await page.goto("http://127.0.0.1:8888/article.html?id=building-autonomous-ai-systems", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  console.log("URL: " + page.url());
  console.log("Title: " + await page.title());

  // Check article content loaded
  const title = await page.locator("#article-title").textContent();
  console.log("Article title: " + title);

  const body = await page.locator("#article-body").textContent();
  console.log("Body preview: " + body.substring(0, 100) + "...");

  await page.screenshot({ path: "test_article_detail.png" });
  await browser.close();
  console.log("Article detail page works!");
}

test().catch(console.error);
