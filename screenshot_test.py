import asyncio
from playwright.async_api import async_playwright

async def test_website():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={'width': 1280, 'height': 800})
        
        # Capture console logs
        console_logs = []
        page.on('console', lambda msg: console_logs.append(f"[{msg.type}] {msg.text}"))
        page.on('pageerror', lambda err: console_logs.append(f"[pageerror] {err}"))
        
        await page.goto('http://localhost:1234', wait_until='networkidle')
        
        # Wait for WebGL and cursor to initialize
        await asyncio.sleep(2)
        
        # Screenshot 1: Initial page load - cursor should be visible in center
        await page.screenshot(path='screenshot_1_initial.png')
        print('Screenshot 1: Initial page load captured')
        
        # Move mouse to test cursor following
        await page.mouse.move(400, 300)
        await asyncio.sleep(0.5)
        await page.screenshot(path='screenshot_2_cursor_moved.png')
        print('Screenshot 2: Cursor moved captured')
        
        # Test hover on link
        link = page.locator('a[href="https://cosine.sh"]').first
        await link.hover()
        await asyncio.sleep(0.5)
        await page.screenshot(path='screenshot_3_hover_link.png')
        print('Screenshot 3: Hover on link captured')
        
        # Scroll down to see more content
        await page.evaluate('() => window.scrollTo(0, 500)')
        await asyncio.sleep(0.5)
        await page.screenshot(path='screenshot_4_scrolled.png')
        print('Screenshot 4: Scrolled view captured')
        
        # Full page screenshot
        await page.screenshot(path='screenshot_5_fullpage.png', full_page=True)
        print('Screenshot 5: Full page captured')
        
        print('\n=== Console Logs ===')
        if console_logs:
            for log in console_logs:
                print(log)
        else:
            print('No console errors - CLEAN!')
        
        await browser.close()

asyncio.run(test_website())
