import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";

const rootDir = process.cwd();

const files = await fg([
  "**/*.html",
  "!node_modules/**",
  "!dist/**",
  "!tmp/**",
  "!scripts/**"
]);

function ensureSeo(data) {
  if (!data.seo || typeof data.seo !== "object") {
    data.seo = {};
  }
  if (!Object.prototype.hasOwnProperty.call(data.seo, "description")) {
    data.seo.description = "";
  }
  if (!Object.prototype.hasOwnProperty.call(data.seo, "title")) {
    data.seo.title = "";
  }
  return data.seo;
}

function computeSlug(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  if (normalized === "index.html") {
    return "/";
  }
  if (normalized.endsWith("/index.html")) {
    const dir = path.posix.dirname(normalized);
    return dir.startsWith(".") ? dir.slice(1) || "/" : `/${dir}`;
  }
  const withoutExt = normalized.replace(/\.html$/, "");
  return withoutExt.startsWith(".") ? withoutExt.slice(1) || "/" : `/${withoutExt}`;
}

for (const file of files) {
  const fullPath = path.join(rootDir, file);
  const raw = await readFile(fullPath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data && typeof parsed.data === "object" ? parsed.data : {};
  let content = parsed.content;

  // Locale
  content = content.replace(/<html([^>]*?)lang="([^"]*)"([^>]*)>/i, (match, before = "", lang = "", after = "") => {
    if (!data.locale) {
      data.locale = lang || "en";
    }
    return `<html${before}lang="{{ locale }}"${after}>`;
  });

  const titleRegex = /<title([^>]*)>([\s\S]*?)<\/title>/i;
  content = content.replace(titleRegex, (match, attrs = "", text = "") => {
    const seo = ensureSeo(data);
    if (!seo.title) {
      seo.title = text.trim();
    }
    return `<title${attrs}>{{ seo.title }}</title>`;
  });

  const metaDescRegex = /<meta\s+name=["']description["'][^>]*>/i;
  content = content.replace(metaDescRegex, (match) => {
    const seo = ensureSeo(data);
    const valueMatch = match.match(/content=["']([^"']*)["']/i);
    if (valueMatch && !valueMatch[1].includes("{{") && !valueMatch[1].includes("}}")) {
      seo.description ||= valueMatch[1].trim();
    }
    return '<meta name="description" content="{{ seo.description }}">';
  });

  const ogTitleRegex = /<meta\s+property=["']og:title["'][^>]*>/i;
  content = content.replace(ogTitleRegex, '<meta property="og:title" content="{{ seo.title }}">');

  const ogDescRegex = /<meta\s+property=["']og:description["'][^>]*>/i;
  content = content.replace(ogDescRegex, '<meta property="og:description" content="{{ seo.description }}">');

  const twitterTitleRegex = /<meta\s+name=["']twitter:title["'][^>]*>/i;
  content = content.replace(twitterTitleRegex, '<meta name="twitter:title" content="{{ seo.title }}">');

  const twitterDescRegex = /<meta\s+name=["']twitter:description["'][^>]*>/i;
  content = content.replace(twitterDescRegex, '<meta name="twitter:description" content="{{ seo.description }}">');

  if (!data.slug) {
    data.slug = computeSlug(file);
  }
  if (!Object.prototype.hasOwnProperty.call(data, "locale")) {
    data.locale = "lv";
  }

  const output = matter.stringify(content, data, { linefeed: "\n" });
  await writeFile(fullPath, output, "utf8");
}
