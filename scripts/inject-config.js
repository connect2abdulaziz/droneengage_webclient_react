/**
 * Injects production auth URL into public/config.json from env (e.g. Railway).
 * Run before build when AUTH_HOST is set.
 * Usage: AUTH_HOST=your-auth.up.railway.app AUTH_PORT=443 node scripts/inject-config.js
 */
const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'public', 'config.json');
const authHost = process.env.AUTH_HOST;
const authPort = process.env.AUTH_PORT || '443';

if (!authHost) {
  console.log('inject-config: AUTH_HOST not set, skipping');
  process.exit(0);
}

function stripComments(text) {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*/g, '');
}

const raw = fs.readFileSync(configPath, 'utf8');
const config = JSON.parse(stripComments(raw));

config.CONST_WEBCONNECTOR_ENABLED = true;
config.CONST_WEBCONNECTOR_AUTH_HOST = authHost;
config.CONST_WEBCONNECTOR_AUTH_PORT = parseInt(authPort, 10);
config.CONST_WEBCONNECTOR_WS_PORT = parseInt(authPort, 10);
config.CONST_WEBCONNECTOR_SECURE = true;
config.CONST_WEBCONNECTOR_BASE_PATH = '';

fs.writeFileSync(configPath, JSON.stringify(config, null, 4), 'utf8');
console.log('inject-config: set auth to', authHost + ':' + authPort);
