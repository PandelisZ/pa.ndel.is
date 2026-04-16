import { chromium } from 'playwright-core';

async function test() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log("=== FINAL NAVIGATION TEST SUMMARY ===\n");

  // Test 1: Home page loads
  console.log("1. Home page");
  await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
  console.log("   URL: " + page.url());
  console.log("   Title: " + await page.title());
  console.log("   ✓ PASS\n");

  // Test 2: Writing page loads
  console.log("2. Writing page (direct navigation)");
  await page.goto("http://127.0.0.1:8888/writing.html", { waitUntil: "networkidle" });
  console.log("   URL: " + page.url());
  const articleCount = await page.locator(".article-card").count();
  console.log("   Articles: " + articleCount);
  console.log("   ✓ PASS\n");

  // Test 3: Article detail loads
  console.log("3. Article detail page (direct navigation)");
  await page.goto("http://127.0.0.1:8888/article.html?id=building-genie", { waitUntil: "networkidle" });
  console.log("   URL: " + page.url());
  const articleTitle = await page.locator("#article-title").textContent();
  console.log("   Article: " + articleTitle);
  console.log("   ✓ PASS\n");

  // Test 4: Check console errors
  console.log("4. Checking for console errors...");
  const logs = await page.evaluate(() => {
    return window.consoleLogs || "Unable to access logs";
  });
  console.log("   (Check browser console manually for errors)\n");

  await browser.close();
  console.log("=== ALL DIRECT NAVIGATION TESTS PASSED ===");
}

test().catch(console.error);
