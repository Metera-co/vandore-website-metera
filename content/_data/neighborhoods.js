const fs = require('fs');
const path = require('path');

function loadCollection(dirName) {
  const dir = path.join(__dirname, '..', dirName);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const fullPath = path.join(dir, file);
      let dataString = fs.readFileSync(fullPath, 'utf8');
      if (dataString.charCodeAt(0) === 0xFEFF) {
        dataString = dataString.slice(1);
      }
      const data = JSON.parse(dataString);
      if (!data.slug) {
        data.slug = path.basename(file, '.json');
      }
      return data;
    });
}

module.exports = () => loadCollection('neighborhoods');