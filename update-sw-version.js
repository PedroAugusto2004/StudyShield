import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Generate new version based on current timestamp
const newVersion = Date.now().toString();
const swPath = path.join(__dirname, 'public', 'sw.js');

// Read current service worker
let swContent = fs.readFileSync(swPath, 'utf8');

// Update version
swContent = swContent.replace(
  /const VERSION = '[^']+';/,
  `const VERSION = '${newVersion}';`
);

// Write updated service worker
fs.writeFileSync(swPath, swContent);

console.log(`Service worker version updated to: ${newVersion}`);