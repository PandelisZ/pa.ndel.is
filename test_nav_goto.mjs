import { chromium } from 'playwright-core';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("Test 1: Direct goto to writing.html");
  await page.goto("http://127.0.0.1:8888/writing.html", { waitUntil: "networkidle" });
  console.log("URL: " + page.url());
  console.log("Title: " + await page.title());
  
  const hasGrid = await page.locator("#article-grid").count() > 0;
  console.log("Has article grid: " + hasGrid);
  
  const articles = await page.locator(".article-card").count();
  console.log("Article cards: " + articles);
  
  await page.screenshot({ path: "test_writing_page.png" });
  
  console.log("\nTest 2: Navigate back to home");
  await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
  console.log("URL: " + page.url());
  await page.screenshot({ path: "test_home_page.png" });
  
  await browser.close();
  console.log("\nDirect navigation works!");
}

test().catch(console.error);
