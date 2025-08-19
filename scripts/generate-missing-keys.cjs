const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '..', 'src', 'locales');
const languages = fs.readdirSync(localesDir).filter(f => fs.statSync(path.join(localesDir, f)).isDirectory());

const data = {};
for (const lang of languages) {
  const file = path.join(localesDir, lang, 'common.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  data[lang] = new Set(Object.keys(json));
}

const allKeys = new Set();
Object.values(data).forEach(set => set.forEach(k => allKeys.add(k)));

let report = '# Missing translation keys\n\n';
for (const lang of languages) {
  const missing = [...allKeys].filter(k => !data[lang].has(k));
  if (missing.length) {
    report += `## ${lang}\n` + missing.map(k => `- ${k}`).join('\n') + '\n\n';
  }
}

fs.writeFileSync(path.join(__dirname, '..', 'missing-keys.md'), report.trim() + '\n');
