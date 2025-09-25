const fs = require('fs');
const path = require('path');

module.exports = () => {
  const dir = path.join(__dirname, '..', 'pages');
  const pages = {};
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      const fullPath = path.join(dir, file);
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
      }
      const data = JSON.parse(content);
      const key = data.slug || path.basename(file, '.json');
      pages[key] = data;
    }
  }
  return { pages };
};