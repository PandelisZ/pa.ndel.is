import { chromium } from "playwright-core";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("console", msg => console.log("[" + msg.type() + "] " + msg.text()));

console.log("Loading home page...");
await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
console.log("Loaded: " + await page.title());
await page.waitForTimeout(2000);

// Check PageTransition state
const state = await page.evaluate(() => ({
  hasPageTransition: typeof window.pageTransition !== "undefined",
  isActive: window.pageTransition?.isActive,
  isTransitioning: window.pageTransition?.isTransitioning?.(),
  currentType: window.pageTransition?.currentType,
  destination: window.pageTransition?.destination
}));

console.log("PageTransition state:", JSON.stringify(state, null, 2));

// Try clicking without waiting for navigation
console.log("\nClicking writing link...");
await page.click("a[href=\"writing.html\"]");

// Check state immediately after click
await page.waitForTimeout(500);
const state2 = await page.evaluate(() => ({
  isActive: window.pageTransition?.isActive,
  destination: window.pageTransition?.destination,
  canvasOpacity: document.querySelector("#transition-canvas")?.style?.opacity,
  canvasExists: !!document.querySelector("#transition-canvas")
}));
console.log("State after click:", JSON.stringify(state2, null, 2));

// Wait for the transition duration (1200ms) + buffer
console.log("\nWaiting for transition...");
await page.waitForTimeout(2000);

const state3 = await page.evaluate(() => ({
  url: window.location.href,
  isActive: window.pageTransition?.isActive
}));
console.log("State after 2s:", JSON.stringify(state3, null, 2));

console.log("\nCurrent URL: " + page.url());

await page.screenshot({ path: "test_nav_state.png" });
await browser.close();
console.log("Done.");
