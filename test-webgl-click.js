const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-webgl']
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const consoleMessages = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    const text = msg.text();
    consoleMessages.push(`[${msg.type()}] ${text}`);
    if (msg.type() === 'error') {
      consoleErrors.push(text);
    }
  });
  
  page.on('pageerror', err => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });
  
  console.log('Navigating to http://localhost:1234...');
  await page.goto('http://localhost:1234', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  console.log('Taking screenshot of home page...');
  await page.screenshot({ path: 'screenshot_home.png', fullPage: true });
  
  console.log('Clicking WRITING link...');
  const writingLink = await page.locator('a[href="/writing.html"]').first();
  
  // Take screenshot during transition (after click but before navigation completes)
  const clickPromise = writingLink.click();
  await page.waitForTimeout(100); // Wait a tiny bit for transition to start
  await page.screenshot({ path: 'screenshot_transition.png', fullPage: true });
  
  // Wait for navigation
  await clickPromise;
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('Taking screenshot after navigation...');
  await page.screenshot({ path: 'screenshot_writing.png', fullPage: true });
  
  const url = page.url();
  console.log('Current URL:', url);
  
  console.log('\n=== CONSOLE MESSAGES ===');
  consoleMessages.forEach(m => console.log(m));
  
  console.log('\n=== CONSOLE ERRORS ===');
  if (consoleErrors.length === 0) {
    console.log('No console errors detected');
  } else {
    consoleErrors.forEach(e => console.log(e));
  }
  
  console.log('\n=== RESULTS ===');
  console.log('Screenshots saved:');
  console.log('  - screenshot_home.png (before click)');
  console.log('  - screenshot_transition.png (during transition)');
  console.log('  - screenshot_writing.png (after navigation)');
  console.log('Navigation to writing.html:', url.includes('writing.html') ? 'SUCCESS' : 'FAILED');
  console.log('Console errors:', consoleErrors.length > 0 ? 'YES' : 'NO');
  console.log('Number of console errors:', consoleErrors.length);
  
  // Check for WebGL-related errors
  const webglErrors = consoleErrors.filter(e => 
    e.includes('THREE') || e.includes('EffectComposer') || e.includes('WebGL')
  );
  console.log('WebGL/Three.js related errors:', webglErrors.length);
  
  await browser.close();
})();
