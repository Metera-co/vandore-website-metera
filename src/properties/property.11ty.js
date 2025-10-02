const fs = require('node:fs');
const path = require('node:path');

function readJsonCollection(relativeDir) {
  const dir = path.join(process.cwd(), relativeDir);
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => {
      const fullPath = path.join(dir, file);
      let raw = fs.readFileSync(fullPath, 'utf8');
      if (raw.charCodeAt(0) === 0xfeff) {
        raw = raw.slice(1);
      }
      const data = JSON.parse(raw);
      const slug = path.basename(file, '.json');
      return {
        slug,
        fileName: file,
        objectPath: path.posix.join(relativeDir.replace(/\\/g, '/'), file),
        ...data
      };
    });
}

module.exports = class {
  data() {
    const properties = readJsonCollection('content/properties');
    return {
      pagination: {
        data: properties,
        size: 1,
        alias: 'property'
      },
      eleventyComputed: {
        permalink: (data) => `properties/${data.property.slug}/index.html`,
        sbObjectId: (data) => data.property.objectPath,
        pageTitle: (data) => `Vandore Heritage - ${data.property.title}`
      }
    };
  }

  render(data) {
    const templatePath = path.join(__dirname, 'property.njk');
    const template = fs.readFileSync(templatePath, 'utf8');
    return this.renderTemplate(template, data, 'njk');
  }
};

