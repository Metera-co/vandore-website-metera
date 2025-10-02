import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import * as cheerio from "cheerio";

const rootDir = process.cwd();

const files = await fg([
  "**/*.html",
  "!node_modules/**",
  "!dist/**",
  "!tmp/**",
  "!scripts/**"
]);

for (const file of files) {
  const fullPath = path.join(rootDir, file);
  const raw = await readFile(fullPath, "utf8");
  const parsed = matter(raw);
  const data = parsed.data || {};
  const originalContent = parsed.content;

  const doctypeMatch = originalContent.match(/^<!doctype html>/i);
  const doctype = doctypeMatch ? doctypeMatch[0] : "";
  const bodyContent = doctypeMatch ? originalContent.slice(doctype.length) : originalContent;

  const $ = cheerio.load(bodyContent, { decodeEntities: false });

  const navParents = $('.offcanvas-body .d-flex.flex-column').filter((_, el) => $(el).find('.navigation').length);
  let changed = false;

  navParents.each((_, parent) => {
    const $parent = $(parent);
    $parent.find('.navigation').each((__, navEl) => {
      const $navEl = $(navEl);
      const $hr = $navEl.next('hr');
      $navEl.remove();
      if ($hr.length) {
        $hr.remove();
      }
    });
    if (!$parent.find('[data-nav-list]').length) {
      $parent.prepend('<div data-nav-list></div>');
    }
    changed = true;
  });

  const contactBlocks = $('.offcanvas-body .d-flex.flex-column.gap-4').filter((_, el) => $(el).find('h6.editable').length);
  contactBlocks.each((_, block) => {
    const $block = $(block);
    if (!$block.attr('data-nav-contact')) {
      $block.attr('data-nav-contact', '');
    }
    $block.children().remove();
    changed = true;
  });

  if (!$('script[src="/js/navigation.js"]').length) {
    $('body').append('\n    <script src="/js/navigation.js" defer></script>');
    changed = true;
  }

  if (!changed) {
    continue;
  }

  let newContent = $.html();
  if (doctype) {
    newContent = `${doctype}\n${newContent}`;
  }

  const output = matter.stringify(newContent, data, { linefeed: "\n" });
  await writeFile(fullPath, output, "utf8");
}
