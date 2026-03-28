import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import toIco from 'to-ico';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const pub = path.join(root, 'public');
const svgPath = path.join(pub, 'favicon.svg');
const svg = fs.readFileSync(svgPath);

const png32 = await sharp(svg).resize(32, 32).png().toBuffer();
const png16 = await sharp(svg).resize(16, 16).png().toBuffer();
const ico = await toIco([png16, png32]);
fs.writeFileSync(path.join(pub, 'favicon.ico'), ico);

await sharp(svg).resize(180, 180).png().toFile(path.join(pub, 'apple-touch-icon.png'));

console.log('Wrote public/favicon.ico and public/apple-touch-icon.png');
