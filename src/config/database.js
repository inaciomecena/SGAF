const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envCandidates = [path.resolve(process.cwd(), '.env'), path.resolve(process.cwd(), '.env.production')];
const envPath = envCandidates.find((p) => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const requireEnv = (name, { allowEmpty = false } = {}) => {
  const value = process.env[name];
  if (typeof value !== 'string') {
    throw new Error(`${name} não configurado. Verifique o arquivo .env do servidor (ou variáveis de ambiente).`);
  }
  if (!allowEmpty && value.trim().length === 0) {
    throw new Error(`${name} não configurado. Verifique o arquivo .env do servidor (ou variáveis de ambiente).`);
  }
  return value;
};

const pool = mysql.createPool({
  host: requireEnv('DB_HOST'),
  user: requireEnv('DB_USER'),
  password: requireEnv('DB_PASS', { allowEmpty: true }),
  database: requireEnv('DB_NAME'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
