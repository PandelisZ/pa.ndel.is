import { chromium } from "playwright-core";

async function test() {
  console.log("Starting navigation test...");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    console.log("\n1. Loading home page...");
    await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
    await page.screenshot({ path: "test_nav_1_home.png" });
    console.log("   Home page loaded");
    console.log("   Title: " + await page.title());
    
    const links = await page.$$eval("[data-internal-link]", ls => ls.map(l => l.textContent.trim()));
    console.log("\n   Found internal links: " + links.join(", "));
    
    console.log("\n2. Clicking WRITING link...");
    await page.click("a[href=\"writing.html\"]");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "test_nav_2_during.png" });
    console.log("   Clicked, waiting...");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "test_nav_3_after.png" });
    
    const url1 = page.url();
    console.log("   Current URL: " + url1);
    console.log(url1.includes("writing.html") ? "   SUCCESS!" : "   FAILED!");
    console.log("   Title: " + await page.title());
    
    const grid = await page.$("#article-grid");
    if (grid) {
      const count = await page.$$eval(".article-card", cs => cs.length);
      console.log("   Articles: " + count);
    }
    
    console.log("\n3. Going back...");
    await page.click("a[href=\"index.html\"]");
    await page.waitForTimeout(2000);
    console.log("   URL: " + page.url());
    await page.screenshot({ path: "test_nav_4_back.png" });
    console.log("\nDone!");
  } catch (e) {
    console.error("Error:", e.message);
    await page.screenshot({ path: "test_nav_error.png" });
  } finally {
    await browser.close();
  }
}

test();
