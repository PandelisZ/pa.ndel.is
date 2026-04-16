const { chromium } = require("playwright");

async function testNavigation() {
  console.log("Starting navigation test...");
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log("\n1. Loading home page...");
    await page.goto("http://localhost:8080/index.html");
    await page.waitForLoadState("networkidle");
    await page.screenshot({ path: "test_nav_1_home.png" });
    console.log("   ✓ Home page loaded");
    
    const homeTitle = await page.title();
    console.log(`   Page title: ${homeTitle}`);
    
    const internalLinks = await page.$$eval("[data-internal-link]", links => 
      links.map(l => ({ href: l.href, text: l.textContent.trim() }))
    );
    console.log(`\n   Found ${internalLinks.length} internal links:`);
    internalLinks.forEach(l => console.log(`     - ${l.text}: ${l.href}`));
    
    console.log("\n2. Clicking WRITING link...");
    await page.click("a[href=\"writing.html\"]");
    await page.waitForTimeout(500);
    await page.screenshot({ path: "test_nav_2_during_transition.png" });
    console.log("   ✓ Clicked WRITING link");
    
    console.log("\n3. Waiting for navigation...");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: "test_nav_3_after_navigation.png" });
    
    const currentUrl = page.url();
    console.log(`   Current URL: ${currentUrl}`);
    
    if (currentUrl.includes("writing.html")) {
      console.log("   ✓ Navigation to writing.html successful!");
    } else {
      console.log("   ✗ Navigation failed");
    }
    
    const writingTitle = await page.title();
    console.log(`   Page title: ${writingTitle}`);
    
    const articleGrid = await page.$("#article-grid");
    if (articleGrid) {
      console.log("   ✓ Article grid element found");
      const articleCount = await page.$$eval(".article-card", cards => cards.length);
      console.log(`   ✓ Found ${articleCount} article cards`);
    } else {
      console.log("   ✗ Article grid not found");
    }
    
    console.log("\n4. Testing navigation back to home...");
    await page.click("a[href=\"index.html\"]");
    await page.waitForTimeout(2000);
    
    const backUrl = page.url();
    console.log(`   Current URL: ${backUrl}`);
    
    if (backUrl.includes("index.html") || backUrl.endsWith("/")) {
      console.log("   ✓ Navigation back successful!");
    } else {
      console.log("   ✗ Navigation back failed");
    }
    
    await page.screenshot({ path: "test_nav_4_back_home.png" });
    console.log("\n✓ All navigation tests completed!");
    
  } catch (error) {
    console.error("Test failed:", error);
    await page.screenshot({ path: "test_nav_error.png" });
  } finally {
    await browser.close();
    console.log("\nBrowser closed.");
  }
}

testNavigation().catch(console.error);

