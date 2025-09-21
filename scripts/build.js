const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const rootDir = path.resolve(__dirname, "..");
const pagesDir = path.join(rootDir, "pages");
const outputDir = path.join(rootDir, "_site");

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function copyDir(source, destination) {
  if (!fs.existsSync(source)) {
    return;
  }
  fs.cpSync(source, destination, { recursive: true });
}

function normalizePath(value) {
  if (!value) {
    return value;
  }
  if (value.startsWith("../")) {
    return "/" + value.replace(/^(\.\.\/)+/, "");
  }
  return value;
}

function normalizeSrcset(value) {
  if (!value) {
    return value;
  }
  return value
    .split(",")
    .map((entry) => {
      const trimmed = entry.trim();
      if (!trimmed) {
        return trimmed;
      }
      const parts = trimmed.split(/\s+/);
      const [first, ...rest] = parts;
      const normalized = normalizePath(first);
      return rest.length ? `${normalized} ${rest.join(" ")}` : normalized;
    })
    .join(", ");
}

function transformHtml(html) {
  const doctypeMatch = html.match(/^(<!DOCTYPE [^>]+>)/i);
  const doctype = doctypeMatch ? `${doctypeMatch[1]}\n` : "";
  const body = doctypeMatch ? html.slice(doctypeMatch[1].length) : html;
  const $ = cheerio.load(body, { decodeEntities: false });

  $("*[src]").each((_, element) => {
    const current = $(element).attr("src");
    const updated = normalizePath(current);
    if (updated !== current) {
      $(element).attr("src", updated);
    }
  });

  $("*[href]").each((_, element) => {
    const current = $(element).attr("href");
    const updated = normalizePath(current);
    if (updated !== current) {
      $(element).attr("href", updated);
    }
  });

  $("*[srcset]").each((_, element) => {
    const current = $(element).attr("srcset");
    const updated = normalizeSrcset(current);
    if (updated !== current) {
      $(element).attr("srcset", updated);
    }
  });

  return `${doctype}${$.html()}`;
}

fs.rmSync(outputDir, { recursive: true, force: true });
ensureDir(outputDir);

const passthroughDirs = ["css", "js", "image", "font", "data", "content"]; // content copied for reference/editing if needed
passthroughDirs.forEach((dirName) => {
  const source = path.join(rootDir, dirName);
  if (fs.existsSync(source)) {
    const target = path.join(outputDir, dirName);
    copyDir(source, target);
  }
});

const pageFiles = fs.readdirSync(pagesDir).filter((file) => file.endsWith(".html"));
pageFiles.forEach((file) => {
  const sourcePath = path.join(pagesDir, file);
  const destinationPath = path.join(outputDir, file);
  const html = fs.readFileSync(sourcePath, "utf8");
  const transformed = transformHtml(html);
  fs.writeFileSync(destinationPath, transformed, "utf8");
});

console.log(`Built ${pageFiles.length} HTML files into ${path.relative(rootDir, outputDir)}`);
