const { chromium } = require('./node_modules/playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
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
  
  // Test 1: Homepage
  console.log('Test 1: Navigating to homepage...');
  await page.goto('http://localhost:8080', { waitUntil: 'networkidle', timeout: 15000 });
  await page.waitForTimeout(2000);
  
  const homeTitle = await page.title();
  console.log('Homepage title:', homeTitle);
  
  // Check for console errors
  console.log('\n=== Console Messages (Homepage) ===');
  consoleMessages.forEach(m => console.log(m));
  
  if (consoleErrors.length > 0) {
    console.log('\n=== Console Errors (Homepage) ===');
    consoleErrors.forEach(e => console.log(e));
  } else {
    console.log('\nNo console errors on homepage');
  }
  
  // Test 2: Navigate to Writing page
  console.log('\nTest 2: Navigating to Writing page...');
  const writingLink = await page.$('a[href="writing.html"]');
  if (writingLink) {
    await writingLink.click();
    await page.waitForTimeout(3000);
    
    const writingUrl = page.url();
    console.log('Current URL:', writingUrl);
    console.log('Navigation to writing.html:', writingUrl.includes('writing.html') ? 'SUCCESS' : 'FAILED');
    
    // Check if articles loaded
    const articleCards = await page.$$('.article-card');
    console.log('Article cards found:', articleCards.length);
  } else {
    console.log('WRITING link not found!');
  }
  
  // Test 3: Navigate to an article
  console.log('\nTest 3: Navigating to article...');
  const articleLink = await page.$('a[href^="article.html"]');
  if (articleLink) {
    await articleLink.click();
    await page.waitForTimeout(3000);
    
    const articleUrl = page.url();
    console.log('Article URL:', articleUrl);
    console.log('Navigation to article:', articleUrl.includes('article.html') ? 'SUCCESS' : 'FAILED');
  } else {
    console.log('Article link not found!');
  }
  
  await browser.close();
})();
