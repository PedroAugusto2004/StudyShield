import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const newVersion = Date.now().toString();
  const swPath = path.join(__dirname, 'public', 'sw.js');

  if (!fs.existsSync(swPath)) {
    console.log('Service worker file not found, skipping version update');
    process.exit(0);
  }

  let swContent = fs.readFileSync(swPath, 'utf8');
  swContent = swContent.replace(
    /const VERSION = '[^']+';/,
    `const VERSION = '${newVersion}';`
  );
  fs.writeFileSync(swPath, swContent);
  console.log(`Service worker version updated to: ${newVersion}`);
} catch (error) {
  console.warn('Failed to update service worker version:', error.message);
  process.exit(0);
}