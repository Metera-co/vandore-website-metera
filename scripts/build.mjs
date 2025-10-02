import { mkdir, readFile, writeFile, copyFile, rm, stat } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");

async function resetDist() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
}

function flattenData(source, prefix = "", target = {}) {
  if (source === null || source === undefined) {
    return target;
  }
  if (Array.isArray(source)) {
    source.forEach((value, index) => {
      const key = prefix ? `${prefix}.${index}` : String(index);
      if (typeof value === "object" && value !== null) {
        flattenData(value, key, target);
      } else {
        target[key] = value;
      }
    });
    return target;
  }
  if (typeof source === "object") {
    for (const [k, value] of Object.entries(source)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof value === "object" && value !== null) {
        flattenData(value, key, target);
      } else {
        target[key] = value;
      }
    }
    return target;
  }
  if (prefix) {
    target[prefix] = source;
  }
  return target;
}

function applyTokens(content, data) {
  if (!data || typeof content !== "string") {
    return content;
  }
  const flat = flattenData(data);
  return content.replace(/{{\s*([\w.-]+)\s*}}/g, (match, key) => {
    return Object.prototype.hasOwnProperty.call(flat, key) ? String(flat[key]) : match;
  });
}

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await mkdir(dir, { recursive: true });
}

async function build() {
  await resetDist();

  const patterns = [
    "**/*",
    "!node_modules/**",
    "!dist/**",
    "!.git/**",
    "!scripts/**",
    "!tmp/**",
    "!package.json",
    "!package-lock.json",
    "!pnpm-lock.yaml",
    "!yarn.lock"
  ];

  const entries = await fg(patterns, { dot: true });

  await Promise.all(entries.map(async (entry) => {
    const srcPath = path.join(rootDir, entry);
    const destPath = path.join(distDir, entry);

    const fileStat = await stat(srcPath);
    if (fileStat.isDirectory()) {
      await mkdir(destPath, { recursive: true });
      return;
    }

    await ensureDir(destPath);

    if (path.extname(entry).toLowerCase() === ".html") {
      const raw = await readFile(srcPath, "utf8");
      const parsed = matter(raw);
      const replaced = applyTokens(parsed.content, parsed.data);
      await writeFile(destPath, replaced, "utf8");
    } else {
      await copyFile(srcPath, destPath);
    }
  }));
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
