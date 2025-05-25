import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../../');

// Paths to rename
const paths = [
  {
    from: path.join(rootDir, 'src/app/shops/[id]'),
    to: path.join(rootDir, 'src/app/shops/[shopId]')
  },
  {
    from: path.join(rootDir, 'src/app/dashboard/admin/shops/[id]'),
    to: path.join(rootDir, 'src/app/dashboard/admin/shops/[shopId]')
  }
];

async function renameRoutes() {
  try {
    for (const { from, to } of paths) {
      if (fs.existsSync(from)) {
        // Create target directory if it doesn't exist
        const targetDir = path.dirname(to);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        
        // Rename directory
        fs.renameSync(from, to);
        console.log(`✅ Renamed ${from} to ${to}`);
      } else {
        console.log(`⚠️ Source path does not exist: ${from}`);
      }
    }
    console.log('🎉 Route renaming complete!');
  } catch (error) {
    console.error('❌ Error renaming routes:', error);
    process.exit(1);
  }
}

renameRoutes();
