const pool = require('./src/config/database');

async function seedMunicipios() {
  let connection;
  try {
    console.log('Obtendo dados do IBGE...');
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/MT/municipios');
    const municipios = await response.json();

    console.log(`Encontrados ${municipios.length} municípios em Mato Grosso.`);

    connection = await pool.getConnection();
    await connection.beginTransaction();

    console.log('Inserindo municípios no banco de dados...');
    
    // Preparar query
    const query = `
      INSERT INTO municipios (codigo_ibge, nome, estado, regiao, ativo)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        nome = VALUES(nome),
        estado = VALUES(estado),
        regiao = VALUES(regiao),
        ativo = VALUES(ativo)
    `;

    for (const mun of municipios) {
      // Formatar o codigo_ibge para garantir que seja uma string
      const codigoIbge = String(mun.id);
      
      await connection.execute(query, [
        codigoIbge,       // codigo_ibge (7 dígitos)
        mun.nome,         // nome
        'MT',             // estado
        'Centro-Oeste',   // regiao
        true              // ativo
      ]);
    }

    await connection.commit();
    console.log('Municípios importados com sucesso!');

  } catch (error) {
    console.error('Erro ao importar municípios:', error);
    if (connection) await connection.rollback();
  } finally {
    if (connection) connection.release();
    process.exit();
  }
}

seedMunicipios();
