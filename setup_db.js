const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function setupDatabase() {
  console.log('Iniciando configuração do banco de dados...');
  
  // Conecta sem selecionar banco de dados inicialmente
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    multipleStatements: true
  });

  try {
    console.log('Conectado ao MySQL!');

    const sqlScript = fs.readFileSync('banco.txt', 'utf8');
    
    // Executa o script completo
    // O script já contém "CREATE DATABASE IF NOT EXISTS" e "USE"
    await connection.query(sqlScript);

    console.log('Script SQL executado com sucesso!');
    console.log('Tabelas criadas.');

  } catch (error) {
    console.error('Erro ao configurar banco de dados:', error);
    if (error.code === 'ECONNREFUSED') {
      console.error('Verifique se o MySQL está rodando e se as credenciais no .env estão corretas.');
    }
  } finally {
    await connection.end();
  }
}

setupDatabase();