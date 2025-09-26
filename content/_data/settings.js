const fs = require('fs');
const path = require('path');

module.exports = () => {
  const dir = path.join(__dirname, '..', 'settings');
  const settings = {};
  if (!fs.existsSync(dir)) return { settings };
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf8');
    if (content.charCodeAt(0) === 0xFEFF) {
      content = content.slice(1);
    }
    const data = JSON.parse(content);
    const key = data.slug || path.basename(file, '.json');
    settings[key] = data;
  }
  return { settings };
};