const fs = require("node:fs");
const path = require("node:path");

function readJsonCollection(relativeDir) {
  const dir = path.join(process.cwd(), relativeDir);
  if (!fs.existsSync(dir)) {
    return [];
  }

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => {
      const fullPath = path.join(dir, file);
      const raw = fs.readFileSync(fullPath, "utf8");
      const data = JSON.parse(raw);
      const slug = path.basename(file, ".json");
      return {
        ...data,
        slug,
        fileName: file,
        objectPath: path.posix.join(relativeDir.replace(/\\/g, "/"), file)
      };
    });
}

function readJsonMap(relativeDir) {
  const collection = readJsonCollection(relativeDir);
  return collection.reduce((acc, item) => {
    acc[item.slug] = item;
    return acc;
  }, {});
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({
    css: "css",
    js: "js",
    image: "image",
    font: "font"
  });

  eleventyConfig.addWatchTarget("content");

  eleventyConfig.addCollection("properties", () => readJsonCollection("content/properties"));
  eleventyConfig.addCollection("blogPosts", () => readJsonCollection("content/blog"));
  eleventyConfig.addGlobalData("properties", () => readJsonCollection("content/properties"));
  eleventyConfig.addGlobalData("propertyMap", () => readJsonMap("content/properties"));
  eleventyConfig.addGlobalData("pagesContent", () => readJsonMap("content/pages"));
  eleventyConfig.addGlobalData("rentals", () => readJsonCollection("content/rentals"));
  eleventyConfig.addGlobalData("blogPosts", () => readJsonCollection("content/blog"));

  eleventyConfig.addFilter("formatPrice", (value) => {
    if (value === undefined || value === null || value === "") {
      return "";
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return value;
    }

    const formatted = new Intl.NumberFormat("lv-LV").format(numeric);
    return `EUR ${formatted}`;
  });

  eleventyConfig.addFilter("formatCurrency", (value, currency = "EUR") => {
    if (value === undefined || value === null || value === "") {
      return "";
    }

    const numeric = Number(value);
    if (Number.isNaN(numeric)) {
      return value;
    }

    return new Intl.NumberFormat("lv-LV", {
      style: "currency",
      currency,
      maximumFractionDigits: 0
    }).format(numeric);
  });

  eleventyConfig.addFilter("withLeadingSlash", (value = "") => {
    if (!value) {
      return "";
    }

    return value.startsWith("/") ? value : `/${value}`;
  });

  return {
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk",
    dir: {
      input: ".",
      includes: "src/_includes",
      data: "content",
      output: "_site"
    }
  };
};


