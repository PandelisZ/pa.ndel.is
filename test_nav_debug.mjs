import { chromium } from "playwright-core";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("console", msg => console.log(`[${msg.type()}] ${msg.text()}`));
page.on("pageerror", err => console.log(`[ERROR] ${err.message}`));

console.log("Loading home page...");
await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
console.log(`Loaded: ${await page.title()}`);
await page.waitForTimeout(2000);

const links = await page.locator("a[href=\"writing.html\"]").count();
console.log(`Found ${links} links to writing.html`);

const hasTransition = await page.evaluate(() => typeof window.pageTransition !== "undefined");
console.log(`PageTransition initialized: ${hasTransition}`);

console.log("Clicking writing link...");
await page.click("a[href=\"writing.html\"]");
await page.waitForTimeout(3000);

const url = page.url();
console.log(`After click, URL: ${url}`);
console.log(url.includes("writing.html") ? "SUCCESS!" : "Navigation may be blocked");

await page.screenshot({ path: "test_nav_debug.png" });
await browser.close();
console.log("Done.");
