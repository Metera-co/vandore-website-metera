const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');

const md = new MarkdownIt({ html: true, linkify: true, typographer: true });

function readFilesRecursive(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return readFilesRecursive(fullPath);
      }
      if (/\.md$|\.markdown$|\.html$/i.test(entry.name)) {
        return [fullPath];
      }
      return [];
    });
}

module.exports = () => {
  const baseDir = path.join(process.cwd(), 'content', 'posts');
  const files = readFilesRecursive(baseDir);

  const list = files
    .map((filePath) => {
      const raw = fs.readFileSync(filePath, 'utf8');
      const parsed = matter(raw);
      const ext = path.extname(filePath).toLowerCase();
      const slug = parsed.data.slug || path.basename(filePath, ext);
      const bodyHtml = ext === '.html' ? parsed.content : md.render(parsed.content || '');
      return {
        ...parsed.data,
        body: bodyHtml,
        rawBody: parsed.content,
        slug,
        sourcePath: path.relative(process.cwd(), filePath)
      };
    })
    .sort((a, b) => {
      const dateA = new Date(a.date || 0).getTime();
      const dateB = new Date(b.date || 0).getTime();
      return dateB - dateA;
    });

  const bySlug = Object.fromEntries(list.map((item) => [item.slug, item]));

  return { list, bySlug };
};
