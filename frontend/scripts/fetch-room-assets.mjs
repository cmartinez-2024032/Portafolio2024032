// Downloads the CC0 models and textures for the intro room from Poly Haven.
// Usage: node scripts/fetch-room-assets.mjs [--dry]
// Keep MODELS in sync with src/components/intro/room/roomScene.js.
import { mkdir, writeFile, access } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "room");
const RES = "1k";
const DRY = process.argv.includes("--dry");

const MODELS = [
  "wooden_bookshelf_worn",
  "book_encyclopedia_set_01",
  "Sofa_01",
  "coffee_table_round_01",
  "potted_plant_02",
  "potted_plant_04",
  "hanging_picture_frame_02",
  "ceramic_vase_01",
];

const TEXTURES = {
  wood_floor: ["Diffuse", "nor_gl", "Rough"],
  beige_wall_001: ["Diffuse", "nor_gl", "Rough"],
};

const api = async (path) => {
  const res = await fetch(`https://api.polyhaven.com${path}`);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
};

const exists = (p) => access(p).then(() => true, () => false);

async function save(url, dest) {
  if (await exists(dest)) return;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

let total = 0;
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`;

for (const id of MODELS) {
  const files = await api(`/files/${id}`);
  const entry = files.gltf?.[RES]?.gltf;
  if (!entry) {
    console.warn(`skip ${id}: no ${RES} glTF`);
    continue;
  }
  const parts = [[`${id}.gltf`, entry.url, entry.size], ...Object.entries(entry.include ?? {}).map(([p, f]) => [p, f.url, f.size])];
  const size = parts.reduce((s, [, , n]) => s + (n ?? 0), 0);
  total += size;
  console.log(`${id.padEnd(28)} ${mb(size)}`);
  if (!DRY) {
    for (const [rel, url] of parts) await save(url, join(ROOT, "models", id, rel));
  }
}

for (const [id, maps] of Object.entries(TEXTURES)) {
  const files = await api(`/files/${id}`);
  let size = 0;
  for (const map of maps) {
    const f = files[map]?.[RES]?.jpg;
    if (!f) {
      console.warn(`skip ${id}/${map}`);
      continue;
    }
    size += f.size ?? 0;
    if (!DRY) await save(f.url, join(ROOT, "textures", id, `${map}.jpg`));
  }
  total += size;
  console.log(`${(id + " (texture)").padEnd(28)} ${mb(size)}`);
}

console.log(`total ${mb(total)}${DRY ? " (dry run)" : ""}`);
