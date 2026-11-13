// Direct Upload deploy to Cloudflare Pages using the `cf` CLI login.
// Usage: node scripts/deploy-pages.js [dir]   (needs `cf auth login` or CLOUDFLARE_API_TOKEN)
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { hash: blake3 } = require('blake3-wasm');

const PROJECT = process.env.CF_PAGES_PROJECT || 'pa-ndel-is';
const ACCOUNT = process.env.CLOUDFLARE_ACCOUNT_ID || '769befa385792ae6e7ca7136b7010256';
const DIR = path.resolve(process.argv[2] || 'dist');
const API = 'https://api.cloudflare.com/client/v4';
const SPECIAL = ['_headers', '_redirects', '_routes.json', '_worker.js'];

function token() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  const cfg = path.join(os.homedir(), 'Library/Preferences/cloudflare/config/default.json');
  return JSON.parse(fs.readFileSync(cfg, 'utf8')).oauth_token;
}

async function api(url, jwt, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: { Authorization: `Bearer ${jwt}`, 'Content-Type': 'application/json' },
  });
  const body = await res.json();
  if (!res.ok || body.success === false) throw new Error(`${url}: ${JSON.stringify(body.errors || body)}`);
  return body.result;
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

const MIME = { html: 'text/html', js: 'application/javascript', css: 'text/css', json: 'application/json',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', svg: 'image/svg+xml', ico: 'image/x-icon',
  map: 'application/json', xml: 'application/xml', woff2: 'font/woff2', txt: 'text/plain' };

(async () => {
  const files = walk(DIR)
    .map((abs) => ({ abs, rel: '/' + path.relative(DIR, abs).split(path.sep).join('/') }))
    .filter((f) => !SPECIAL.includes(path.basename(f.rel)) && !f.rel.endsWith('.DS_Store'))
    .map((f) => {
      const ext = path.extname(f.abs).slice(1);
      const b64 = fs.readFileSync(f.abs).toString('base64');
      return { ...f, b64, type: MIME[ext] || 'application/octet-stream',
        hash: Buffer.from(blake3(b64 + ext)).toString('hex').slice(0, 32) };
    });

  const { jwt } = await api(`${API}/accounts/${ACCOUNT}/pages/projects/${PROJECT}/upload-token`, token());
  const missing = new Set(await api(`${API}/pages/assets/check-missing`, jwt,
    { method: 'POST', body: JSON.stringify({ hashes: files.map((f) => f.hash) }) }));
  const todo = files.filter((f) => missing.has(f.hash));
  console.log(`${files.length} files, ${todo.length} to upload`);

  for (let i = 0; i < todo.length; i += 50) {
    const batch = todo.slice(i, i + 50).map((f) => ({
      key: f.hash, value: f.b64, metadata: { contentType: f.type }, base64: true }));
    await api(`${API}/pages/assets/upload`, jwt, { method: 'POST', body: JSON.stringify(batch) });
  }
  await api(`${API}/pages/assets/upsert-hashes`, jwt,
    { method: 'POST', body: JSON.stringify({ hashes: files.map((f) => f.hash) }) });

  const manifest = JSON.stringify(Object.fromEntries(files.map((f) => [f.rel, f.hash])));
  const args = ['-y', 'cf@latest', 'pages', 'deployments', 'create', PROJECT,
    '--branch', 'master', '--manifest', manifest];
  for (const [flag, name] of [['--redirects', '_redirects'], ['--routes-json', '_routes.json']]) {
    const p = path.join(DIR, name);
    if (fs.existsSync(p)) args.push(flag, '@' + p);
  }
  console.log(execFileSync('npx', args, { encoding: 'utf8' }));
})().catch((e) => { console.error(e.message); process.exit(1); });
