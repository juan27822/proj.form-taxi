const fs = require('fs');
const path = require('path');

const translations = {};

function loadTranslations() {
  const localesDir = path.join(__dirname, 'locales');
  try {
    // --- CORRECCIÓN: Comprobar si el directorio existe antes de leerlo ---
    if (!fs.existsSync(localesDir)) {
      console.log('Backend locales directory not found, skipping translation loading.');
      return;
    }
    const localeFiles = fs.readdirSync(localesDir);
    for (const file of localeFiles) {
      if (file.endsWith('.json')) {
        const lang = file.split('.')[0];
        const data = fs.readFileSync(path.join(localesDir, file), 'utf8');
        translations[lang] = JSON.parse(data);
      }
    }
    console.log('Backend translations loaded successfully.');
  } catch (error) {
    console.error('Error reading locales directory:', error);
  }
}

function t(lang, key, options = {}) {
  const translation = translations[lang]?.[key] || key;
  return Object.entries(options).reduce((acc, [k, v]) => acc.replace(`{${k}}`, v), translation);
}

module.exports = { loadTranslations, t };