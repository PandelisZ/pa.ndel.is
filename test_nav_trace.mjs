import { chromium } from "playwright-core";

const browser = await chromium.launch();
const page = await browser.newPage();

console.log("Testing with detailed click tracing...");

await page.goto("http://127.0.0.1:8888/index.html", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

console.log("Clicking writing link...");

// Use force: true to bypass any click interception
const clickResult = await page.evaluate(async () => {
  const links = Array.from(document.querySelectorAll("a[href=writing.html]"));
  if (links.length === 0) return { error: "No links found" };
  
  const link = links[0];
  console.log("Found link:", link.textContent.trim());
  
  // Simulate the click ourselves
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window
  });
  
  // Track if default was prevented
  let defaultPrevented = false;
  const originalPreventDefault = event.preventDefault.bind(event);
  event.preventDefault = function() {
    defaultPrevented = true;
    originalPreventDefault();
  };
  
  link.dispatchEvent(event);
  
  return {
    linkText: link.textContent.trim(),
    defaultPrevented: defaultPrevented,
    isActive: window.pageTransition?.isActive,
    destination: window.pageTransition?.destination
  };
});

console.log("Click result:", JSON.stringify(clickResult, null, 2));

await page.waitForTimeout(2000);

const finalState = await page.evaluate(() => ({
  url: window.location.href,
  isActive: window.pageTransition?.isActive
}));

console.log("Final state:", JSON.stringify(finalState, null, 2));

await browser.close();
console.log("Done.");

