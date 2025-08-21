import fs from 'fs';
import path from 'path';

function getKeys(obj, prefix = '') {
  return Object.keys(obj).reduce((res, el) => {
    if (typeof obj[el] === 'object' && obj[el] !== null && !Array.isArray(obj[el])) {
      return [...res, ...getKeys(obj[el], prefix + el + '.')];
    }
    return [...res, prefix + el];
  }, []);
}

const localesDir = path.resolve(process.cwd(), 'src/locales');
const languages = ['hi', 'ta', 'te'];
const namespaces = ['common', 'auth', 'dashboard'];

let missingKeys = false;

console.log('🔍 Checking for missing i18n keys...');

for (const ns of namespaces) {
  const enPath = path.join(localesDir, 'en', `${ns}.json`);
  if (!fs.existsSync(enPath)) {
    console.error(`❌ Base language file not found: ${enPath}`);
    process.exit(1);
  }
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const enKeys = getKeys(enContent);

  for (const lang of languages) {
    const langPath = path.join(localesDir, lang, `${ns}.json`);
    if (!fs.existsSync(langPath)) {
      console.error(`\n❌ [${lang.toUpperCase()}] Missing namespace file: ${ns}.json`);
      missingKeys = true;
      continue;
    }
    const langContent = JSON.parse(fs.readFileSync(langPath, 'utf8'));
    const langKeys = getKeys(langContent);

    const missing = enKeys.filter(key => !langKeys.includes(key));

    if (missing.length > 0) {
      missingKeys = true;
      console.error(`\n❌ [${lang.toUpperCase()}] Missing keys in namespace "${ns}":`);
      missing.forEach(key => console.log(`   - ${key}`));
    }
  }
}

if (missingKeys) {
  console.error('\n🚨 Found missing translation keys. Please update the locale files.');
  process.exit(1);
} else {
  console.log('\n✅ All i18n keys are in sync!');
  process.exit(0);
}