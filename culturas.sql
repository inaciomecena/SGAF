-- --------------------------------------------------------
-- Servidor:                     localhost
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para agricultura_municipal
CREATE DATABASE IF NOT EXISTS `agricultura_municipal` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `agricultura_municipal`;

-- Copiando estrutura para tabela agricultura_municipal.culturas_saf
DROP TABLE IF EXISTS `culturas_saf`;
CREATE TABLE IF NOT EXISTS `culturas_saf` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome_cultura` varchar(120) NOT NULL,
  `nome_cientifico` varchar(150) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `tipo_ciclo` varchar(30) DEFAULT NULL,
  `finalidade` varchar(100) DEFAULT NULL,
  `tempo_producao_anos` int(11) DEFAULT NULL,
  `origem` varchar(50) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela agricultura_municipal.culturas_saf: ~59 rows (aproximadamente)
DELETE FROM `culturas_saf`;
INSERT INTO `culturas_saf` (`id`, `nome_cultura`, `nome_cientifico`, `categoria`, `tipo_ciclo`, `finalidade`, `tempo_producao_anos`, `origem`, `observacoes`, `ativo`, `created_at`) VALUES
	(1, 'Milho', 'Zea mays', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(2, 'Arroz', 'Oryza sativa', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(3, 'Feijão', 'Phaseolus vulgaris', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(4, 'Feijão Caupi', 'Vigna unguiculata', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(5, 'Sorgo', 'Sorghum bicolor', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(6, 'Mandioca', 'Manihot esculenta', 'ANUAL', 'MEDIO', 'Alimentação', 2, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(7, 'Batata Doce', 'Ipomoea batatas', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(8, 'Inhame', 'Dioscorea spp', 'ANUAL', 'MEDIO', 'Alimentação', 2, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(9, 'Cará', 'Dioscorea alata', 'ANUAL', 'MEDIO', 'Alimentação', 2, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(10, 'Abóbora', 'Cucurbita moschata', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(11, 'Pepino', 'Cucumis sativus', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(12, 'Tomate', 'Solanum lycopersicum', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(13, 'Pimentão', 'Capsicum annuum', 'ANUAL', 'CURTO', 'Alimentação', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(14, 'Banana', 'Musa spp', 'FRUTIFERA', 'PERENE', 'Comercial', 20, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(15, 'Abacaxi', 'Ananas comosus', 'FRUTIFERA', 'MEDIO', 'Comercial', 3, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(16, 'Mamão', 'Carica papaya', 'FRUTIFERA', 'MEDIO', 'Comercial', 4, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(17, 'Maracujá', 'Passiflora edulis', 'FRUTIFERA', 'MEDIO', 'Comercial', 4, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(18, 'Manga', 'Mangifera indica', 'FRUTIFERA', 'LONGO', 'Comercial', 30, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(19, 'Goiaba', 'Psidium guajava', 'FRUTIFERA', 'LONGO', 'Comercial', 25, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(20, 'Acerola', 'Malpighia emarginata', 'FRUTIFERA', 'LONGO', 'Comercial', 20, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(21, 'Caju', 'Anacardium occidentale', 'FRUTIFERA', 'LONGO', 'Comercial', 30, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(22, 'Graviola', 'Annona muricata', 'FRUTIFERA', 'LONGO', 'Comercial', 25, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(23, 'Atemóia', 'Annona atemoya', 'FRUTIFERA', 'LONGO', 'Comercial', 20, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(24, 'Açaí', 'Euterpe oleracea', 'FRUTIFERA', 'LONGO', 'Comercial', 25, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(25, 'Cupuaçu', 'Theobroma grandiflorum', 'FRUTIFERA', 'LONGO', 'Comercial', 30, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(26, 'Buriti', 'Mauritia flexuosa', 'FRUTIFERA', 'LONGO', 'Comercial', 40, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(27, 'Pupunha', 'Bactris gasipaes', 'FRUTIFERA', 'LONGO', 'Comercial', 30, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(28, 'Tucumã', 'Astrocaryum aculeatum', 'FRUTIFERA', 'LONGO', 'Comercial', 40, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(29, 'Café', 'Coffea arabica', 'PERENE', 'LONGO', 'Comercial', 20, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(30, 'Cacau', 'Theobroma cacao', 'PERENE', 'LONGO', 'Comercial', 30, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(31, 'Guaraná', 'Paullinia cupana', 'PERENE', 'LONGO', 'Comercial', 30, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(32, 'Pimenta do Reino', 'Piper nigrum', 'PERENE', 'LONGO', 'Comercial', 20, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(33, 'Urucum', 'Bixa orellana', 'PERENE', 'LONGO', 'Comercial', 15, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(34, 'Mogno', 'Swietenia macrophylla', 'FLORESTAL', 'LONGO', 'Madeira', 40, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(35, 'Cedro', 'Cedrela fissilis', 'FLORESTAL', 'LONGO', 'Madeira', 30, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(36, 'Ipê', 'Handroanthus spp', 'FLORESTAL', 'LONGO', 'Madeira', 50, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(37, 'Jatobá', 'Hymenaea courbaril', 'FLORESTAL', 'LONGO', 'Madeira', 50, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(38, 'Andiroba', 'Carapa guianensis', 'FLORESTAL', 'LONGO', 'Madeira/óleo', 40, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(39, 'Angelim', 'Dinizia excelsa', 'FLORESTAL', 'LONGO', 'Madeira', 60, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(40, 'Freijó', 'Cordia goeldiana', 'FLORESTAL', 'LONGO', 'Madeira', 35, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(41, 'Paricá', 'Schizolobium amazonicum', 'FLORESTAL', 'MEDIO', 'Madeira', 15, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(42, 'Mucuna', 'Mucuna pruriens', 'ADUBACAO_VERDE', 'CURTO', 'Solo', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(43, 'Feijão Guandu', 'Cajanus cajan', 'ADUBACAO_VERDE', 'MEDIO', 'Solo', 2, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(44, 'Crotalária', 'Crotalaria juncea', 'ADUBACAO_VERDE', 'CURTO', 'Solo', 1, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(45, 'Leucena', 'Leucaena leucocephala', 'ADUBACAO_VERDE', 'LONGO', 'Solo', 10, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(46, 'Gliricídia', 'Gliricidia sepium', 'ADUBACAO_VERDE', 'LONGO', 'Solo', 15, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(47, 'Hortelã', 'Mentha spp', 'MEDICINAL', 'CURTO', 'Medicinal', 3, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(48, 'Erva Cidreira', 'Melissa officinalis', 'MEDICINAL', 'CURTO', 'Medicinal', 3, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(49, 'Capim Santo', 'Cymbopogon citratus', 'MEDICINAL', 'PERENE', 'Medicinal', 5, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(50, 'Alecrim', 'Rosmarinus officinalis', 'MEDICINAL', 'PERENE', 'Medicinal', 8, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(51, 'Manjericão', 'Ocimum basilicum', 'MEDICINAL', 'CURTO', 'Medicinal', 2, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(52, 'Gengibre', 'Zingiber officinale', 'CONDIMENTAR', 'MEDIO', 'Condimento', 3, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(53, 'Açafrão da Terra', 'Curcuma longa', 'CONDIMENTAR', 'MEDIO', 'Condimento', 3, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(54, 'Dendê', 'Elaeis guineensis', 'OLEAGINOSA', 'LONGO', 'Óleo', 30, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(55, 'Pequi', 'Caryocar brasiliense', 'OLEAGINOSA', 'LONGO', 'Alimentação', 40, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(56, 'Macaúba', 'Acrocomia aculeata', 'OLEAGINOSA', 'LONGO', 'Óleo', 40, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(57, 'Castanha do Brasil', 'Bertholletia excelsa', 'OLEAGINOSA', 'LONGO', 'Alimento', 60, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(58, 'Cana de Açúcar', 'Saccharum officinarum', 'ENERGETICA', 'MEDIO', 'Energia', 6, NULL, NULL, 1, '2026-03-07 21:06:33'),
	(59, 'Bambu', 'Bambusa spp', 'ENERGETICA', 'LONGO', 'Energia', 30, NULL, NULL, 1, '2026-03-07 21:06:33');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
