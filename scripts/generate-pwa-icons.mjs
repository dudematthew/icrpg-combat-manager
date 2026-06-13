import sharp from "sharp";
import { bumpSwCache } from "./bump-sw-cache.mjs";

const SOURCE = "public/thumb.png";
const BACKGROUND = { r: 220, g: 38, b: 38, alpha: 1 };

const outputs = [
  { size: 192, file: "public/pwa-192.png" },
  { size: 512, file: "public/pwa-512.png" },
  { size: 180, file: "public/apple-touch-icon.png" },
];

for (const { size, file } of outputs) {
  await sharp(SOURCE)
    .resize(size, size, { fit: "contain", background: BACKGROUND })
    .png()
    .toFile(file);
  console.log(`Wrote ${file}`);
}

bumpSwCache();
