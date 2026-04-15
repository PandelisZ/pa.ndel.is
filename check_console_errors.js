const http = require('http');

// Fetch main.js and look for potential issues
async function checkForErrors() {
  console.log('=== Checking for Potential JavaScript Issues ===\n');
  
  const html = await new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 8080, path: '/', method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });
    req.on('error', reject);
    req.end();
  });
  
  const jsMatch = html.match(/src="\/(main\.[a-f0-9]+\.js)"/);
  const jsPath = jsMatch ? jsMatch[1] : 'main.1f19ae8e.js';
  
  const js = await new Promise((resolve, reject) => {
    const req = http.request({ hostname: 'localhost', port: 8080, path: `/${jsPath}`, method: 'GET' }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    });
    req.on('error', reject);
    req.end();
  });
  
  // Check for common error patterns
  const checks = [
    ['Undefined variable references', /undefined.*variable|not defined|ReferenceError/],
    ['Null pointer risks', /null\.|undefined\./],
    ['Missing error handling', /try\s*\{\s*\}/],
    ['Console error calls', /console\.error/],
    ['TODO comments', /TODO|FIXME/]
  ];
  
  console.log('Static Analysis Results:');
  let issuesFound = false;
  for (const [desc, pattern] of checks) {
    const matches = js.match(pattern);
    if (matches) {
      console.log(`   ⚠️  ${desc}: Found ${matches.length} occurrences`);
      issuesFound = true;
    } else {
      console.log(`   ✅ ${desc}: None found`);
    }
  }
  
  // Check Three.js initialization patterns
  console.log('\nThree.js Integration Checks:');
  const threeChecks = [
    ['Renderer creation', 'new THREE.WebGLRenderer'],
    ['Scene creation', 'new THREE.Scene'],
    ['Camera setup', 'new THREE.PerspectiveCamera'],
    ['Composer initialization', 'new THREE.EffectComposer'],
    ['Animation loop', 'requestAnimationFrame']
  ];
  
  for (const [desc, pattern] of threeChecks) {
    const found = js.includes(pattern);
    console.log(`   ${found ? '✅' : '❌'} ${desc}`);
  }
  
  // Check cursor initialization is properly guarded
  console.log('\nCursor Implementation Checks:');
  const cursorChecks = [
    ['initCustomCursor function exists', js.includes('initCustomCursor')],
    ['Cursor DOM element creation', js.includes("createElement('div')") || js.includes('className = "custom-cursor"')],
    ['Mouse move event listener', js.includes('mousemove') || js.includes('pointermove')],
    ['Touch device detection', js.includes('matchMedia') && js.includes('pointer: coarse')],
    ['Cursor hidden on touch', js.includes('isTouchDevice')]
  ];
  
  for (const [desc, found] of cursorChecks) {
    console.log(`   ${found ? '✅' : '❌'} ${desc}`);
  }
  
  console.log('\n=== Summary ===');
  console.log(issuesFound ? '   ⚠️  Potential issues found (review recommended)' : '   ✅ No obvious issues detected');
  console.log('   Note: Runtime console errors can only be verified in an actual browser environment');
}

checkForErrors().catch(console.error);
