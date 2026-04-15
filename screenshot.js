const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  // Capture console logs
  const consoleLogs = [];
  page.on('console', msg => consoleLogs.push({type: msg.type(), text: msg.text()}));
  page.on('pageerror', error => consoleLogs.push({type: 'error', text: error.message}));
  
  await page.goto('http://localhost:1234', { waitUntil: 'networkidle2' });
  
  // Wait for WebGL and cursor to initialize
  await page.waitForTimeout(2000);
  
  // Screenshot 1: Initial page load - cursor should be visible in center
  await page.screenshot({ path: 'screenshot_1_initial.png', fullPage: false });
  console.log('Screenshot 1: Initial page load captured');
  
  // Move mouse to test cursor following
  await page.mouse.move(400, 300);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_2_cursor_moved.png', fullPage: false });
  console.log('Screenshot 2: Cursor moved captured');
  
  // Test hover on link
  await page.hover('a[href="https://cosine.sh"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_3_hover_link.png', fullPage: false });
  console.log('Screenshot 3: Hover on link captured');
  
  // Scroll down to see more content and WebGL
  await page.evaluate(() => window.scrollTo(0, 500));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_4_scrolled.png', fullPage: false });
  console.log('Screenshot 4: Scrolled view captured');
  
  // Full page screenshot
  await page.screenshot({ path: 'screenshot_5_fullpage.png', fullPage: true });
  console.log('Screenshot 5: Full page captured');
  
  console.log('\n=== Console Logs ===');
  consoleLogs.forEach(log => console.log(`[${log.type}] ${log.text}`));
  
  if (consoleLogs.length === 0) {
    console.log('No console errors - CLEAN!');
  }
  
  await browser.close();
})();
