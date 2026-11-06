import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const assetsDirectory = path.join(projectRoot, "dist", "assets");

const files = await readdir(assetsDirectory);
const assets = await Promise.all(
  files
    .filter((name) => /\.(?:js|css)$/.test(name))
    .map(async (name) => ({ name, bytes: (await stat(path.join(assetsDirectory, name))).size })),
);

assets.sort((a, b) => b.bytes - a.bytes);
const total = assets.reduce((sum, asset) => sum + asset.bytes, 0);
const kilobytes = (bytes) => `${(bytes / 1024).toFixed(2)} kB`;

console.log("FUID production asset report");
console.log(`JavaScript/CSS assets: ${assets.length}`);
console.log(`Combined uncompressed size: ${kilobytes(total)}`);
console.log("Largest assets:");
for (const asset of assets.slice(0, 10)) console.log(`- ${asset.name}: ${kilobytes(asset.bytes)}`);
