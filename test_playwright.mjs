import { chromium } from 'playwright-core';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({type: msg.type(), text: msg.text()}));
  page.on('pageerror', error => consoleLogs.push({type: 'pageerror', text: error.message}));
  
  // Navigate to the page
  console.log('Navigating to http://localhost:1234...');
  await page.goto('http://localhost:1234', { waitUntil: 'networkidle' });
  
  // Wait for page to fully load including WebGL and cursor
  await page.waitForTimeout(3000);
  
  // Screenshot 1: Initial page load - cursor should be visible in center
  await page.screenshot({ path: 'screenshot_3_cursor_center.png' });
  console.log('Screenshot 3: Initial page load captured (cursor in center)');
  
  // Move mouse to test cursor following (to coordinates 400, 300)
  await page.mouse.move(400, 300);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_4_cursor_moved.png' });
  console.log('Screenshot 4: Cursor moved to position captured');
  
  // Test hover on a link (Cosine AI link)
  const link = await page.locator('a[href="https://cosine.sh"]').first();
  if (await link.isVisible()) {
    await link.hover();
    await page.waitForTimeout(500);
    await page.screenshot({ path: 'screenshot_5_hover_link.png' });
    console.log('Screenshot 5: Hover on link captured');
  }
  
  // Scroll down to see more content
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_6_scrolled.png' });
  console.log('Screenshot 6: Scrolled view captured');
  
  // Full page screenshot
  await page.screenshot({ path: 'screenshot_7_fullpage_check.png', fullPage: true });
  console.log('Screenshot 7: Full page captured');
  
  // Check for custom cursor elements
  const cursorExists = await page.locator('.custom-cursor').count();
  const cursorDepthExists = await page.locator('.custom-cursor-depth').count();
  const heroCanvasExists = await page.locator('#hero-canvas').count();
  
  console.log('\n=== Element Check ===');
  console.log(`Custom cursor element exists: ${cursorExists > 0 ? 'YES' : 'NO'}`);
  console.log(`Custom cursor depth element exists: ${cursorDepthExists > 0 ? 'YES' : 'NO'}`);
  console.log(`Hero canvas (WebGL) exists: ${heroCanvasExists > 0 ? 'YES' : 'NO'}`);
  
  console.log('\n=== Console Logs ===');
  if (consoleLogs.length === 0) {
    console.log('✅ No console errors - CLEAN!');
  } else {
    consoleLogs.forEach(log => console.log(`[${log.type}] ${log.text}`));
  }
  
  await browser.close();
})();
