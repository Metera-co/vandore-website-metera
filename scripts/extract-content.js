const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const rootDir = path.resolve(__dirname, "..");
const pagesDir = path.join(rootDir, "pages");
const contentRoot = path.join(rootDir, "content");

function tokenize(pathString) {
  const tokens = [];
  const regex = /([^\.\[\]]+)|(\[(\d+)\])/g;
  let match;
  while ((match = regex.exec(pathString)) !== null) {
    if (match[1]) {
      tokens.push(match[1]);
    } else if (match[3]) {
      tokens.push(Number(match[3]));
    }
  }
  return tokens;
}

function ensureContainer(target, key, nextToken) {
  const nextIsIndex = typeof nextToken === "number";
  if (typeof target[key] === "undefined") {
    target[key] = nextIsIndex ? [] : {};
  } else if (nextIsIndex && !Array.isArray(target[key])) {
    target[key] = [];
  } else if (!nextIsIndex && (typeof target[key] !== "object" || target[key] === null || Array.isArray(target[key]))) {
    target[key] = {};
  }
  return target[key];
}

function setDeep(target, pathString, value) {
  if (!pathString) {
    return;
  }
  const tokens = tokenize(pathString);
  if (!tokens.length) {
    return;
  }

  let current = target;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    const isLast = i === tokens.length - 1;
    const nextToken = tokens[i + 1];

    if (typeof token === "number") {
      if (!Array.isArray(current)) {
        throw new Error(`Invalid path: expected array before index ${token} in ${pathString}`);
      }
      if (isLast) {
        current[token] = value;
      } else {
        if (typeof current[token] === "undefined") {
          current[token] = typeof nextToken === "number" ? [] : {};
        }
        current = current[token];
      }
    } else if (isLast) {
      current[token] = value;
    } else {
      current = ensureContainer(current, token, nextToken);
    }
  }
}

function sortKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortKeys);
  }
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortKeys(value[key]);
        return acc;
      }, {});
  }
  return value;
}

function getElementContent($el) {
  const html = $el.html();
  if (typeof html === "string") {
    const trimmed = html.trim();
    if (trimmed.includes("<")) {
      return trimmed;
    }
  }
  const text = $el.text();
  return typeof text === "string" ? text.trim() : "";
}

function cleanPath(rawPath) {
  const trimmed = rawPath.trim();
  if (!trimmed) {
    return "";
  }
  const colonIndex = trimmed.lastIndexOf(":");
  const withoutPrefix = colonIndex >= 0 ? trimmed.slice(colonIndex + 1) : trimmed;
  return withoutPrefix.trim();
}

function handleField($el, rawPath, data) {
  if (!rawPath) {
    return;
  }
  const pathWithAttr = cleanPath(rawPath);
  if (!pathWithAttr) {
    return;
  }
  const hashIndex = pathWithAttr.indexOf("#@");
  const pathOnly = hashIndex >= 0 ? pathWithAttr.slice(0, hashIndex) : pathWithAttr;
  const attrName = hashIndex >= 0 ? pathWithAttr.slice(hashIndex + 2) : null;
  if (!pathOnly) {
    return;
  }

  if (attrName) {
    const value = $el.attr(attrName);
    if (typeof value !== "undefined" && value !== "") {
      const trimmedValue = typeof value === "string" ? value.trim() : value;
      setDeep(data, pathOnly, trimmedValue);
    }
    return;
  }

  if ($el.find("[data-sb-field-path]").length > 0) {
    return;
  }
  const content = getElementContent($el);
  if (content !== "") {
    setDeep(data, pathOnly, content);
  }
}

function handleAltField($el, rawPath, data) {
  if (!rawPath) {
    return;
  }
  const cleaned = cleanPath(rawPath);
  if (!cleaned) {
    return;
  }
  const hashIndex = cleaned.indexOf("#@");
  const pathOnly = hashIndex >= 0 ? cleaned.slice(0, hashIndex) : cleaned;
  const attrName = hashIndex >= 0 ? cleaned.slice(hashIndex + 2) : "alt";
  if (!pathOnly) {
    return;
  }
  const value = $el.attr(attrName);
  if (typeof value !== "undefined" && value !== "") {
    const trimmedValue = typeof value === "string" ? value.trim() : value;
    setDeep(data, pathOnly, trimmedValue);
  }
}

fs.mkdirSync(contentRoot, { recursive: true });

const files = fs.readdirSync(pagesDir).filter((file) => file.endsWith(".html"));

files.forEach((file) => {
  const filePath = path.join(pagesDir, file);
  const html = fs.readFileSync(filePath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });
  const objectId = $("html").attr("data-sb-object-id");

  if (!objectId) {
    console.warn(`Skipping ${file} - missing data-sb-object-id`);
    return;
  }

  const relativePath = objectId.replace(/^content\//, "");
  const outputPath = path.join(contentRoot, relativePath);
  const data = {};

  $("[data-sb-field-path]").each((_, element) => {
    const $element = $(element);
    const raw = $element.attr("data-sb-field-path");
    if (!raw) {
      return;
    }
    raw.split(/\s+/).forEach((part) => {
      handleField($element, part, data);
    });
  });

  $("[data-sb-alt-field]").each((_, element) => {
    const $element = $(element);
    const raw = $element.attr("data-sb-alt-field");
    handleAltField($element, raw, data);
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const sorted = sortKeys(data);
  fs.writeFileSync(outputPath, `${JSON.stringify(sorted, null, 2)}\n`, "utf8");
  console.log(`Generated ${path.relative(rootDir, outputPath)}`);
});
