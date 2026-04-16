import { chromium } from "playwright-core";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("console", msg => console.log("[" + msg.type() + "] " + msg.text()));

console.log("Loading home page...");
await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
console.log("Loaded: " + await page.title());
await page.waitForTimeout(2000);

const hasTransition = await page.evaluate(() => typeof window.pageTransition !== "undefined");
console.log("PageTransition: " + hasTransition);

console.log("\nClicking writing link and waiting for navigation...");

// Use Promise.all to wait for navigation after click
await Promise.all([
  page.waitForNavigation({ timeout: 10000 }),
  page.click("a[href=\"writing.html\"]")
]);

console.log("Navigation complete!");
console.log("URL: " + page.url());
console.log("Title: " + await page.title());

// Check for article grid
const grid = await page.$("#article-grid");
if (grid) {
  const count = await page.$$eval(".article-card", cs => cs.length);
  console.log("Articles found: " + count);
} else {
  console.log("No article grid found");
}

await page.screenshot({ path: "test_nav_success.png" });

// Navigate back
console.log("\nNavigating back...");
await Promise.all([
  page.waitForNavigation({ timeout: 10000 }),
  page.click("a[href=\"index.html\"]")
]);

console.log("Back navigation complete!");
console.log("URL: " + page.url());

await page.screenshot({ path: "test_nav_back.png" });
await browser.close();
console.log("\nDone! Navigation test PASSED!");
