
async function testarCadastro() {
  console.log("Iniciando teste de cadastro...");
  
  const dados = {
    cnpj_cpf: "123456789" + Math.floor(Math.random() * 100).toString().padStart(2, '0'),
    razao_social: "Fazenda Modelo Teste " + Date.now(),
    nome_fantasia: "Agro Teste",
    inscricao_estadual: "123456789",
    endereco: "Estrada Rural km 10",
    municipio: "Cuiaba",
    uf: "MT",
    cep: "78000000",
    telefone: "65999999999",
    email: "teste@fazenda.com",
    atividade_principal: "LEITE",
    
    // Passo 1 extras
    agricultura_familiar: true,
    localizacao: "Zona Rural",
    latitude: "-15.1234",
    longitude: "-56.1234",
    
    // Passo 2
    possui_capacitacao: true,
    possui_assistencia_tecnica: true,
    possui_registro_anterior: false,
    produtos: "Queijo, Leite Pasteurizado",
    
    // Passo 3
    compartilha_area_producao: false,
    area_construida: 150.5,
    participa_outra_empresa: false,
    possui_filial: false,
    participa_capital_outra: false,
    socio_outra_empresa_nao_beneficiada: false,
    socio_administrador_outra: false,
    
    // Passo 4
    resp_legal_nome: "João da Silva",
    resp_legal_cpf: "11122233344",
    resp_tecnico_nome: "Maria Veterinária",
    resp_tecnico_conselho: "CRMV-MT 1234",
    
    // Passo 5
    resp_cadastro_nome: "João da Silva",
    resp_cadastro_entidade: "Próprio",
    resp_cadastro_is_dono: true,
    ciente_requisitos: true
  };

  try {
    const response = await fetch('http://localhost:3000/api/agroindustrias', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dados)
    });

    if (response.ok) {
        const json = await response.json();
        console.log("Cadastro realizado com sucesso!");
        console.log("Status:", response.status);
        console.log("Dados retornados:", json);
    } else {
        const errorText = await response.text();
        console.error("Erro ao cadastrar:");
        console.error("Status:", response.status);
        console.error("Erro:", errorText);
    }
  } catch (error) {
    console.error("Erro de conexão:");
    console.error(error);
  }
}

testarCadastro();
