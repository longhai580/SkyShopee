const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.resolve(__dirname, '../.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split(/\r?\n/);

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '' || trimmedLine.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmedLine.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmedLine.slice(0, separatorIndex).trim();
    let value = trimmedLine.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function getEnv(name, fallback) {
  const value = process.env[name];
  if (value !== undefined && value !== '') {
    return value;
  }
  return fallback;
}

loadEnvFile();

const MyConstants = {
  DB_URI: getEnv('DB_URI', ''),
  DB_DATABASE: getEnv('DB_DATABASE', 'skyshop'),
  JWT_SECRET: 'caigicungduoc',
  JWT_EXPIRES: '36000000', // in milliseconds
  EMAIL_USER: 'shoppingonline', // gmail service
  EMAIL_PASS: 'stntkzczrduetzzf'
};
module.exports = MyConstants;
