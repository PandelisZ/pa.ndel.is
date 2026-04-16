import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({
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
  
  console.log('Navigating to http://localhost:8080...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  
  await page.waitForTimeout(2000);
  
  console.log('Taking initial screenshot...');
  await page.screenshot({ path: '/tmp/screenshot_home.png', fullPage: true });
  
  console.log('Looking for WRITING link...');
  const writingLink = await page.$('a[href="writing.html"]');
  if (!writingLink) {
    console.log('WRITING link not found, checking for other navigation...');
    const allLinks = await page.$$('a');
    for (const link of allLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`Found link: text="${text?.trim()}" href="${href}"`);
    }
  } else {
    console.log('Found WRITING link, clicking it...');
    await writingLink.click();
  }
  
  await page.waitForTimeout(3000);
  
  console.log('Taking screenshot after navigation...');
  await page.screenshot({ path: '/tmp/screenshot_after.png', fullPage: true });
  
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
  console.log('Transition effect visible: CHECK SCREENSHOTS at /tmp/screenshot_home.png and /tmp/screenshot_after.png');
  console.log('Navigation to writing.html:', url.includes('writing.html') ? 'SUCCESS' : 'FAILED');
  console.log('Console errors:', consoleErrors.length > 0 ? 'YES' : 'NO');
  
  await browser.close();
})();
