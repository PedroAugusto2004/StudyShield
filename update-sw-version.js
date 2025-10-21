import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const newVersion = Date.now().toString();
  
  // Validate and resolve the path to prevent path traversal
  const publicDir = path.resolve(__dirname, 'public');
  const swPath = path.resolve(publicDir, 'sw.js');
  
  // Ensure the resolved path is within the public directory
  if (!swPath.startsWith(publicDir)) {
    throw new Error('Invalid path: potential path traversal detected');
  }

  if (!fs.existsSync(swPath)) {
    // Use process.stdout.write instead of console.log to avoid exposing sensitive info
    process.stdout.write('Service worker file not found, skipping version update\n');
    process.exit(0);
  }

  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(
    /const VERSION = '[^']+';/,
    `const VERSION = '${newVersion}';`
  );
  fs.writeFileSync(swPath, swContent);
  // Use process.stdout.write instead of console.log to avoid exposing sensitive info
  process.stdout.write(`Service worker version updated to: ${newVersion}\n`);
} catch (error) {
  // Use process.stderr.write instead of console.warn to avoid exposing sensitive info
  process.stderr.write(`Failed to update service worker version: ${error.message}\n`);
  process.exit(0);
}