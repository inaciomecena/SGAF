const culturaSafRepository = require('../repositories/culturaSafRepository');

const CULTURAS_INICIAIS = [
  ['Milho', 'Zea mays', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Arroz', 'Oryza sativa', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Feijão', 'Phaseolus vulgaris', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Feijão Caupi', 'Vigna unguiculata', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Sorgo', 'Sorghum bicolor', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Mandioca', 'Manihot esculenta', 'ANUAL', 'MEDIO', 'Alimentação', 2],
  ['Batata Doce', 'Ipomoea batatas', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Inhame', 'Dioscorea spp', 'ANUAL', 'MEDIO', 'Alimentação', 2],
  ['Cará', 'Dioscorea alata', 'ANUAL', 'MEDIO', 'Alimentação', 2],
  ['Abóbora', 'Cucurbita moschata', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Pepino', 'Cucumis sativus', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Tomate', 'Solanum lycopersicum', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Pimentão', 'Capsicum annuum', 'ANUAL', 'CURTO', 'Alimentação', 1],
  ['Banana', 'Musa spp', 'FRUTIFERA', 'PERENE', 'Comercial', 20],
  ['Abacaxi', 'Ananas comosus', 'FRUTIFERA', 'MEDIO', 'Comercial', 3],
  ['Mamão', 'Carica papaya', 'FRUTIFERA', 'MEDIO', 'Comercial', 4],
  ['Maracujá', 'Passiflora edulis', 'FRUTIFERA', 'MEDIO', 'Comercial', 4],
  ['Manga', 'Mangifera indica', 'FRUTIFERA', 'LONGO', 'Comercial', 30],
  ['Goiaba', 'Psidium guajava', 'FRUTIFERA', 'LONGO', 'Comercial', 25],
  ['Acerola', 'Malpighia emarginata', 'FRUTIFERA', 'LONGO', 'Comercial', 20],
  ['Caju', 'Anacardium occidentale', 'FRUTIFERA', 'LONGO', 'Comercial', 30],
  ['Graviola', 'Annona muricata', 'FRUTIFERA', 'LONGO', 'Comercial', 25],
  ['Atemóia', 'Annona atemoya', 'FRUTIFERA', 'LONGO', 'Comercial', 20],
  ['Açaí', 'Euterpe oleracea', 'FRUTIFERA', 'LONGO', 'Comercial', 25],
  ['Cupuaçu', 'Theobroma grandiflorum', 'FRUTIFERA', 'LONGO', 'Comercial', 30],
  ['Buriti', 'Mauritia flexuosa', 'FRUTIFERA', 'LONGO', 'Comercial', 40],
  ['Pupunha', 'Bactris gasipaes', 'FRUTIFERA', 'LONGO', 'Comercial', 30],
  ['Tucumã', 'Astrocaryum aculeatum', 'FRUTIFERA', 'LONGO', 'Comercial', 40],
  ['Café', 'Coffea arabica', 'PERENE', 'LONGO', 'Comercial', 20],
  ['Cacau', 'Theobroma cacao', 'PERENE', 'LONGO', 'Comercial', 30],
  ['Guaraná', 'Paullinia cupana', 'PERENE', 'LONGO', 'Comercial', 30],
  ['Pimenta do Reino', 'Piper nigrum', 'PERENE', 'LONGO', 'Comercial', 20],
  ['Urucum', 'Bixa orellana', 'PERENE', 'LONGO', 'Comercial', 15],
  ['Mogno', 'Swietenia macrophylla', 'FLORESTAL', 'LONGO', 'Madeira', 40],
  ['Cedro', 'Cedrela fissilis', 'FLORESTAL', 'LONGO', 'Madeira', 30],
  ['Ipê', 'Handroanthus spp', 'FLORESTAL', 'LONGO', 'Madeira', 50],
  ['Jatobá', 'Hymenaea courbaril', 'FLORESTAL', 'LONGO', 'Madeira', 50],
  ['Andiroba', 'Carapa guianensis', 'FLORESTAL', 'LONGO', 'Madeira/óleo', 40],
  ['Angelim', 'Dinizia excelsa', 'FLORESTAL', 'LONGO', 'Madeira', 60],
  ['Freijó', 'Cordia goeldiana', 'FLORESTAL', 'LONGO', 'Madeira', 35],
  ['Paricá', 'Schizolobium amazonicum', 'FLORESTAL', 'MEDIO', 'Madeira', 15],
  ['Mucuna', 'Mucuna pruriens', 'ADUBACAO_VERDE', 'CURTO', 'Solo', 1],
  ['Feijão Guandu', 'Cajanus cajan', 'ADUBACAO_VERDE', 'MEDIO', 'Solo', 2],
  ['Crotalária', 'Crotalaria juncea', 'ADUBACAO_VERDE', 'CURTO', 'Solo', 1],
  ['Leucena', 'Leucaena leucocephala', 'ADUBACAO_VERDE', 'LONGO', 'Solo', 10],
  ['Gliricídia', 'Gliricidia sepium', 'ADUBACAO_VERDE', 'LONGO', 'Solo', 15],
  ['Hortelã', 'Mentha spp', 'MEDICINAL', 'CURTO', 'Medicinal', 3],
  ['Erva Cidreira', 'Melissa officinalis', 'MEDICINAL', 'CURTO', 'Medicinal', 3],
  ['Capim Santo', 'Cymbopogon citratus', 'MEDICINAL', 'PERENE', 'Medicinal', 5],
  ['Alecrim', 'Rosmarinus officinalis', 'MEDICINAL', 'PERENE', 'Medicinal', 8],
  ['Manjericão', 'Ocimum basilicum', 'MEDICINAL', 'CURTO', 'Medicinal', 2],
  ['Gengibre', 'Zingiber officinale', 'CONDIMENTAR', 'MEDIO', 'Condimento', 3],
  ['Açafrão da Terra', 'Curcuma longa', 'CONDIMENTAR', 'MEDIO', 'Condimento', 3],
  ['Dendê', 'Elaeis guineensis', 'OLEAGINOSA', 'LONGO', 'Óleo', 30],
  ['Pequi', 'Caryocar brasiliense', 'OLEAGINOSA', 'LONGO', 'Alimentação', 40],
  ['Macaúba', 'Acrocomia aculeata', 'OLEAGINOSA', 'LONGO', 'Óleo', 40],
  ['Castanha do Brasil', 'Bertholletia excelsa', 'OLEAGINOSA', 'LONGO', 'Alimento', 60],
  ['Cana de Açúcar', 'Saccharum officinarum', 'ENERGETICA', 'MEDIO', 'Energia', 6],
  ['Bambu', 'Bambusa spp', 'ENERGETICA', 'LONGO', 'Energia', 30]
];

const CATEGORIAS_INICIAIS = [
  { nome: 'ANUAL', descricao: 'Culturas de ciclo anual' },
  { nome: 'FRUTIFERA', descricao: 'Culturas frutíferas perenes ou semiperenes' },
  { nome: 'FLORESTAL', descricao: 'Espécies madeireiras e florestais' },
  { nome: 'PERENE', descricao: 'Culturas permanentes de longo prazo' },
  { nome: 'MEDICINAL', descricao: 'Plantas com finalidade medicinal' },
  { nome: 'CONDIMENTAR', descricao: 'Plantas aromáticas e condimentos' },
  { nome: 'ADUBACAO_VERDE', descricao: 'Espécies para cobertura e recuperação de solo' },
  { nome: 'OLEAGINOSA', descricao: 'Culturas produtoras de óleo' },
  { nome: 'ENERGETICA', descricao: 'Culturas para produção energética' }
];

class CulturaSafService {
  async inicializarBase() {
    await culturaSafRepository.ensureSchema();
    await culturaSafRepository.seedCategorias(CATEGORIAS_INICIAIS);
    const total = await culturaSafRepository.countAll();
    if (total > 0) return;
    await culturaSafRepository.bulkInsert(
      CULTURAS_INICIAIS.map((item) => ({
        nome_cultura: item[0],
        nome_cientifico: item[1],
        categoria: item[2],
        tipo_ciclo: item[3],
        finalidade: item[4],
        tempo_producao_anos: item[5]
      }))
    );
  }

  async listar(filtros) {
    await this.inicializarBase();
    return culturaSafRepository.findAll(filtros);
  }

  async criar(dados) {
    await this.inicializarBase();
    return culturaSafRepository.create(dados);
  }

  async detalhar(id) {
    await this.inicializarBase();
    return culturaSafRepository.findById(id);
  }

  async atualizar(id, dados) {
    await this.inicializarBase();
    return culturaSafRepository.update(id, dados);
  }
}

module.exports = new CulturaSafService();
