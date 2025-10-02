#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const contentDir = path.join(root, 'content', 'properties');
const outputDir = path.join(root, '_site', 'properties');

function countJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    return 0;
  }
  return fs.readdirSync(dir).filter((file) => file.endsWith('.json')).length;
}

function countGeneratedPages(dir) {
  if (!fs.existsSync(dir)) {
    return 0;
  }
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      const indexPath = path.join(dir, entry.name, 'index.html');
      if (fs.existsSync(indexPath)) {
        count += 1;
      }
    }
  }
  return count;
}

const jsonCount = countJsonFiles(contentDir);
const htmlCount = countGeneratedPages(outputDir);

console.log(`JSON_COUNT=${jsonCount}  HTML_COUNT=${htmlCount}`);

if (jsonCount !== htmlCount) {
  console.error('Property verification failed: JSON files and generated pages do not match.');
  process.exit(1);
}
