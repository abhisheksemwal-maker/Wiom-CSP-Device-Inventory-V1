const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8095;
const ASSETS = __dirname;
const REVIEW_FILE = path.join(__dirname, 'design-review.json');
let reloadFlag = false;

const MIME = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.writeHead(200); res.end(); return; }

  // API: POST review
  if (req.method === 'POST' && req.url === '/api/review') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      fs.writeFileSync(REVIEW_FILE, body);
      console.log('[review] Saved design-review.json (' + body.length + ' bytes)');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    });
    return;
  }

  // API: GET review
  if (req.method === 'GET' && req.url === '/api/review') {
    if (fs.existsSync(REVIEW_FILE)) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(fs.readFileSync(REVIEW_FILE));
    } else {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('[]');
    }
    return;
  }

  // API: reload signal
  if (req.url === '/api/reload') {
    reloadFlag = true;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end('{"ok":true}');
    return;
  }

  // API: check reload
  if (req.url === '/api/check-reload') {
    const flag = reloadFlag;
    reloadFlag = false;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ reload: flag }));
    return;
  }

  // Static files
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = path.join(ASSETS, url.pathname === '/' ? 'index.html' : url.pathname);

  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`[inventory-server] Serving ${ASSETS} on http://localhost:${PORT}`);
});
