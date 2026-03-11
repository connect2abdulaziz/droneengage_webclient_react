/**
 * Serve the production build on process.env.PORT (for Railway etc).
 * Usage: node scripts/serve-build.js
 */
const http = require('http');
const path = require('path');
const fs = require('fs');

const buildPath = path.join(__dirname, '..', 'build');
const port = Number(process.env.PORT) || 3000;

if (!fs.existsSync(buildPath)) {
  console.error('Build folder not found at', buildPath);
  console.error('Run "npm run build" first.');
  process.exit(1);
}

const mime = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.css': 'text/css',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/index.html';
  const filePath = path.join(buildPath, path.normalize(urlPath));

  if (!filePath.startsWith(buildPath)) {
    res.statusCode = 403;
    res.end();
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        fs.readFile(path.join(buildPath, 'index.html'), (e, indexData) => {
          if (e) { res.statusCode = 500; res.end(); return; }
          res.setHeader('Content-Type', 'text/html');
          res.end(indexData);
        });
      } else {
        res.statusCode = 500;
        res.end();
      }
      return;
    }
    const ext = path.extname(filePath);
    res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
    res.end(data);
  });
});

server.listen(port, '0.0.0.0', () => {
  console.log('Serving build at http://0.0.0.0:' + port);
});
