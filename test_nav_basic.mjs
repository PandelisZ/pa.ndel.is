import { chromium } from "playwright-core";

const browser = await chromium.launch();
const page = await browser.newPage();

console.log("Testing basic navigation WITHOUT PageTransition...");

// Navigate to home with transition disabled via localStorage
await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });

// Override the page transition to disable it
await page.evaluate(() => {
  // Disable PageTransition by setting reduced motion
  Object.defineProperty(window, "matchMedia", {
    value: (query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      addListener: () => {},
      removeListener: () => {}
    })
  });
});

// Reload to apply the change
await page.reload({ waitUntil: "networkidle" });
console.log("Page reloaded with reduced motion");

// Check if PageTransition is now disabled
const hasTransition = await page.evaluate(() => typeof window.pageTransition !== "undefined");
console.log("PageTransition exists: " + hasTransition);

// Now test clicking
console.log("\nClicking writing link...");
await Promise.all([
  page.waitForNavigation({ timeout: 10000 }),
  page.click("a[href=\"writing.html\"]")
]);

console.log("Navigation successful!");
console.log("URL: " + page.url());
console.log("Title: " + await page.title());

await page.screenshot({ path: "test_nav_basic.png" });
await browser.close();
console.log("Done!");
