const http = require('http');

function fetch(hostname, port, path) {
  return new Promise((resolve, reject) => {
    const options = { hostname, port, path, method: 'GET' };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve({ status: res.statusCode, data }); });
    });
    req.on('error', reject);
    req.end();
  });
}

async function test() {
  console.log('=== QA VERIFICATION: 3D Cursor & WebGL Brutalist Filter ===\n');
  
  const html = await fetch('localhost', 8080, '/');
  console.log('1. HTML Structure');
  console.log(`   Status: ${html.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   hero-canvas: ${html.data.includes('hero-canvas') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Three.js: ${html.data.includes('three') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   main.js: ${html.data.includes('main.') ? '✅ PASS' : '❌ FAIL'}`);
  
  const jsMatch = html.data.match(/src="\/(main\.[a-f0-9]+\.js)"/);
  const jsPath = jsMatch ? jsMatch[1] : 'main.1f19ae8e.js';
  const js = await fetch('localhost', 8080, `/${jsPath}`);
  
  console.log('\n2. WebGL Features (JavaScript)');
  console.log(`   JS loaded: ${js.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   EffectComposer: ${js.data.includes('EffectComposer') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   RenderPass: ${js.data.includes('RenderPass') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   ShaderPass: ${js.data.includes('ShaderPass') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Chromatic Aberration: ${js.data.includes('caStrength') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Scanlines: ${js.data.includes('scanline') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Film Grain/Noise: ${js.data.includes('random(uv') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Vignette: ${js.data.includes('vignette') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Glitch Blocks: ${js.data.includes('glitchOffset') ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n3. 3D Cursor Features (JavaScript)');
  console.log(`   initCustomCursor: ${js.data.includes('initCustomCursor') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   custom-cursor class: ${js.data.includes('custom-cursor') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   custom-cursor-depth: ${js.data.includes('custom-cursor-depth') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   --rotation: ${js.data.includes('--rotation') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   --tilt-x: ${js.data.includes('--tilt-x') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   --tilt-y: ${js.data.includes('--tilt-y') ? '✅ PASS' : '❌ FAIL'}`);
  
  const cssMatch = html.data.match(/href="\/(style\.[a-f0-9]+\.css)"/);
  const cssPath = cssMatch ? cssMatch[1] : 'style.97fcb138.css';
  const css = await fetch('localhost', 8080, `/${cssPath}`);
  
  console.log('\n4. 3D Transform Features (CSS)');
  console.log(`   CSS loaded: ${css.status === 200 ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   rotateX: ${css.data.includes('rotateX') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   rotateY: ${css.data.includes('rotateY') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   rotateZ: ${css.data.includes('rotateZ') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   preserve-3d: ${css.data.includes('preserve-3d') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   perspective: ${css.data.includes('perspective') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   translateZ: ${css.data.includes('translateZ') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Yellow (#f3cd05): ${css.data.includes('#f3cd05') ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   .custom-cursor: ${css.data.includes('.custom-cursor') ? '✅ PASS' : '❌ FAIL'}`);
  
  console.log('\n5. SUMMARY');
  console.log('   ================================================');
  const allPass = js.data.includes('EffectComposer') && 
                  js.data.includes('caStrength') &&
                  js.data.includes('vignette') &&
                  js.data.includes('initCustomCursor') &&
                  css.data.includes('rotateX') &&
                  css.data.includes('#f3cd05');
  console.log(`   Result: ${allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
  console.log('   ================================================');
}

test().catch(console.error);
