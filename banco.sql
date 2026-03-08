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
CREATE DATABASE IF NOT EXISTS `agricultura_municipal` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `agricultura_municipal`;

-- Copiando estrutura para tabela agricultura_municipal.agendamentos_maquinas
DROP TABLE IF EXISTS `agendamentos_maquinas`;
CREATE TABLE IF NOT EXISTS `agendamentos_maquinas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `maquina_id` int(11) DEFAULT NULL,
  `produtor_id` int(11) DEFAULT NULL,
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  `operador_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maquina_id` (`maquina_id`),
  KEY `produtor_id` (`produtor_id`),
  KEY `operador_id` (`operador_id`),
  CONSTRAINT `agendamentos_maquinas_ibfk_1` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`),
  CONSTRAINT `agendamentos_maquinas_ibfk_2` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`),
  CONSTRAINT `agendamentos_maquinas_ibfk_3` FOREIGN KEY (`operador_id`) REFERENCES `operadores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.agendamentos_maquinas: ~0 rows (aproximadamente)
DELETE FROM `agendamentos_maquinas`;

-- Copiando estrutura para tabela agricultura_municipal.anexos
DROP TABLE IF EXISTS `anexos`;
CREATE TABLE IF NOT EXISTS `anexos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tabela` varchar(100) DEFAULT NULL,
  `registro_id` int(11) DEFAULT NULL,
  `arquivo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.anexos: ~0 rows (aproximadamente)
DELETE FROM `anexos`;

-- Copiando estrutura para tabela agricultura_municipal.associacoes
DROP TABLE IF EXISTS `associacoes`;
CREATE TABLE IF NOT EXISTS `associacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_associacao_ibge` (`codigo_ibge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.associacoes: ~0 rows (aproximadamente)
DELETE FROM `associacoes`;

-- Copiando estrutura para tabela agricultura_municipal.atendimentos
DROP TABLE IF EXISTS `atendimentos`;
CREATE TABLE IF NOT EXISTS `atendimentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `produtor_id` int(11) DEFAULT NULL,
  `tecnico_id` int(11) DEFAULT NULL,
  `tipo_atendimento_id` int(11) DEFAULT NULL,
  `data_atendimento` date DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_atend_ibge` (`codigo_ibge`),
  KEY `produtor_id` (`produtor_id`),
  KEY `tecnico_id` (`tecnico_id`),
  KEY `tipo_atendimento_id` (`tipo_atendimento_id`),
  CONSTRAINT `atendimentos_ibfk_1` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`),
  CONSTRAINT `atendimentos_ibfk_2` FOREIGN KEY (`tecnico_id`) REFERENCES `usuarios` (`id`),
  CONSTRAINT `atendimentos_ibfk_3` FOREIGN KEY (`tipo_atendimento_id`) REFERENCES `tipos_atendimento` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.atendimentos: ~15 rows (aproximadamente)
DELETE FROM `atendimentos`;
INSERT INTO `atendimentos` (`id`, `codigo_ibge`, `produtor_id`, `tecnico_id`, `tipo_atendimento_id`, `data_atendimento`, `descricao`, `latitude`, `longitude`) VALUES
	(1, '1234567', 1, 2, 5, '2026-02-20', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(2, '1234567', 1, 2, 2, '2026-02-10', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(3, '1234567', 4, 2, 3, '2026-02-17', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(4, '1234567', 3, 2, 1, '2026-02-11', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(5, '1234567', 4, 2, 5, '2026-02-20', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(6, '1234567', 2, 2, 5, '2026-02-19', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(7, '1234567', 2, 2, 4, '2026-03-05', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(8, '1234567', 5, 2, 1, '2026-02-06', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(9, '1234567', 4, 2, 2, '2026-02-27', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(10, '1234567', 2, 2, 3, '2026-02-20', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(11, '1234567', 2, 2, 2, '2026-03-03', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(12, '1234567', 5, 2, 3, '2026-02-20', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(13, '1234567', 5, 2, 3, '2026-02-23', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(14, '1234567', 5, 2, 3, '2026-02-05', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL),
	(15, '1234567', 5, 2, 1, '2026-03-05', 'Atendimento realizado com sucesso. Produtor orientado sobre as melhores práticas.', NULL, NULL);

-- Copiando estrutura para tabela agricultura_municipal.auditoria
DROP TABLE IF EXISTS `auditoria`;
CREATE TABLE IF NOT EXISTS `auditoria` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `acao` varchar(150) DEFAULT NULL,
  `data` timestamp NOT NULL DEFAULT current_timestamp(),
  `ip` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `auditoria_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.auditoria: ~0 rows (aproximadamente)
DELETE FROM `auditoria`;

-- Copiando estrutura para tabela agricultura_municipal.configuracoes_municipio
DROP TABLE IF EXISTS `configuracoes_municipio`;
CREATE TABLE IF NOT EXISTS `configuracoes_municipio` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `chave_config` varchar(100) DEFAULT NULL,
  `valor` text DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.configuracoes_municipio: ~0 rows (aproximadamente)
DELETE FROM `configuracoes_municipio`;

-- Copiando estrutura para tabela agricultura_municipal.cooperativas
DROP TABLE IF EXISTS `cooperativas`;
CREATE TABLE IF NOT EXISTS `cooperativas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `cnpj` varchar(20) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_coop_ibge` (`codigo_ibge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.cooperativas: ~0 rows (aproximadamente)
DELETE FROM `cooperativas`;

-- Copiando estrutura para tabela agricultura_municipal.culturas
DROP TABLE IF EXISTS `culturas`;
CREATE TABLE IF NOT EXISTS `culturas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(120) DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.culturas: ~0 rows (aproximadamente)
DELETE FROM `culturas`;

-- Copiando estrutura para tabela agricultura_municipal.distribuicao_insumos
DROP TABLE IF EXISTS `distribuicao_insumos`;
CREATE TABLE IF NOT EXISTS `distribuicao_insumos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `insumo_id` int(11) DEFAULT NULL,
  `produtor_id` int(11) DEFAULT NULL,
  `quantidade` decimal(10,2) DEFAULT NULL,
  `data_entrega` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `insumo_id` (`insumo_id`),
  KEY `produtor_id` (`produtor_id`),
  CONSTRAINT `distribuicao_insumos_ibfk_1` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`),
  CONSTRAINT `distribuicao_insumos_ibfk_2` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.distribuicao_insumos: ~0 rows (aproximadamente)
DELETE FROM `distribuicao_insumos`;

-- Copiando estrutura para tabela agricultura_municipal.documentos_propriedade
DROP TABLE IF EXISTS `documentos_propriedade`;
CREATE TABLE IF NOT EXISTS `documentos_propriedade` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `propriedade_id` int(11) DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `arquivo` varchar(255) DEFAULT NULL,
  `data_upload` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `propriedade_id` (`propriedade_id`),
  CONSTRAINT `documentos_propriedade_ibfk_1` FOREIGN KEY (`propriedade_id`) REFERENCES `propriedades` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.documentos_propriedade: ~0 rows (aproximadamente)
DELETE FROM `documentos_propriedade`;

-- Copiando estrutura para tabela agricultura_municipal.enderecos_produtor
DROP TABLE IF EXISTS `enderecos_produtor`;
CREATE TABLE IF NOT EXISTS `enderecos_produtor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `produtor_id` int(11) DEFAULT NULL,
  `logradouro` varchar(150) DEFAULT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `produtor_id` (`produtor_id`),
  CONSTRAINT `enderecos_produtor_ibfk_1` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.enderecos_produtor: ~5 rows (aproximadamente)
DELETE FROM `enderecos_produtor`;
INSERT INTO `enderecos_produtor` (`id`, `produtor_id`, `logradouro`, `numero`, `bairro`, `cidade`, `cep`) VALUES
	(1, 1, 'Rua Principal', NULL, 'Comunidade do Sol', 'Cidade Exemplo', '00000-000'),
	(2, 2, 'Rua Principal', NULL, 'Bairro das Flores', 'Cidade Exemplo', '00000-000'),
	(3, 3, 'Rua Principal', NULL, 'Comunidade Verde', 'Cidade Exemplo', '00000-000'),
	(4, 4, 'Rua Principal', NULL, 'Bairro Alto', 'Cidade Exemplo', '00000-000'),
	(5, 5, 'Rua Principal', NULL, 'Comunidade do Rio', 'Cidade Exemplo', '00000-000');

-- Copiando estrutura para tabela agricultura_municipal.estoque_insumos
DROP TABLE IF EXISTS `estoque_insumos`;
CREATE TABLE IF NOT EXISTS `estoque_insumos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `insumo_id` int(11) DEFAULT NULL,
  `quantidade` decimal(12,2) DEFAULT NULL,
  `data_entrada` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `insumo_id` (`insumo_id`),
  CONSTRAINT `estoque_insumos_ibfk_1` FOREIGN KEY (`insumo_id`) REFERENCES `insumos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.estoque_insumos: ~0 rows (aproximadamente)
DELETE FROM `estoque_insumos`;

-- Copiando estrutura para tabela agricultura_municipal.eventos
DROP TABLE IF EXISTS `eventos`;
CREATE TABLE IF NOT EXISTS `eventos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `local` varchar(150) DEFAULT NULL,
  `data` date DEFAULT NULL,
  `instrutor` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_evento_ibge` (`codigo_ibge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.eventos: ~0 rows (aproximadamente)
DELETE FROM `eventos`;

-- Copiando estrutura para tabela agricultura_municipal.fotos_atendimento
DROP TABLE IF EXISTS `fotos_atendimento`;
CREATE TABLE IF NOT EXISTS `fotos_atendimento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `atendimento_id` int(11) DEFAULT NULL,
  `arquivo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `atendimento_id` (`atendimento_id`),
  CONSTRAINT `fotos_atendimento_ibfk_1` FOREIGN KEY (`atendimento_id`) REFERENCES `atendimentos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.fotos_atendimento: ~0 rows (aproximadamente)
DELETE FROM `fotos_atendimento`;

-- Copiando estrutura para tabela agricultura_municipal.horas_maquina
DROP TABLE IF EXISTS `horas_maquina`;
CREATE TABLE IF NOT EXISTS `horas_maquina` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `agendamento_id` int(11) DEFAULT NULL,
  `horas_trabalhadas` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `agendamento_id` (`agendamento_id`),
  CONSTRAINT `horas_maquina_ibfk_1` FOREIGN KEY (`agendamento_id`) REFERENCES `agendamentos_maquinas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.horas_maquina: ~0 rows (aproximadamente)
DELETE FROM `horas_maquina`;

-- Copiando estrutura para tabela agricultura_municipal.insumos
DROP TABLE IF EXISTS `insumos`;
CREATE TABLE IF NOT EXISTS `insumos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `unidade` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_insumo_ibge` (`codigo_ibge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.insumos: ~0 rows (aproximadamente)
DELETE FROM `insumos`;

-- Copiando estrutura para tabela agricultura_municipal.logs_acesso
DROP TABLE IF EXISTS `logs_acesso`;
CREATE TABLE IF NOT EXISTS `logs_acesso` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `ip` varchar(50) DEFAULT NULL,
  `data_login` datetime DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `logs_acesso_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.logs_acesso: ~0 rows (aproximadamente)
DELETE FROM `logs_acesso`;

-- Copiando estrutura para tabela agricultura_municipal.logs_sistema
DROP TABLE IF EXISTS `logs_sistema`;
CREATE TABLE IF NOT EXISTS `logs_sistema` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `acao` varchar(100) DEFAULT NULL,
  `tabela` varchar(100) DEFAULT NULL,
  `registro_id` int(11) DEFAULT NULL,
  `data` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `logs_sistema_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.logs_sistema: ~0 rows (aproximadamente)
DELETE FROM `logs_sistema`;

-- Copiando estrutura para tabela agricultura_municipal.manutencoes_maquinas
DROP TABLE IF EXISTS `manutencoes_maquinas`;
CREATE TABLE IF NOT EXISTS `manutencoes_maquinas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `maquina_id` int(11) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `data` date DEFAULT NULL,
  `custo` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `maquina_id` (`maquina_id`),
  CONSTRAINT `manutencoes_maquinas_ibfk_1` FOREIGN KEY (`maquina_id`) REFERENCES `maquinas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.manutencoes_maquinas: ~0 rows (aproximadamente)
DELETE FROM `manutencoes_maquinas`;

-- Copiando estrutura para tabela agricultura_municipal.maquinas
DROP TABLE IF EXISTS `maquinas`;
CREATE TABLE IF NOT EXISTS `maquinas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `modelo` varchar(120) DEFAULT NULL,
  `ano` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_maquina_ibge` (`codigo_ibge`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.maquinas: ~5 rows (aproximadamente)
DELETE FROM `maquinas`;
INSERT INTO `maquinas` (`id`, `codigo_ibge`, `nome`, `modelo`, `ano`, `status`) VALUES
	(1, '1234567', 'Trator John Deere', 'Modelo A', 2020, 'Operacional'),
	(2, '1234567', 'Trator Massey Ferguson', 'Modelo B', 2018, 'Manutenção'),
	(3, '1234567', 'Plantadeira', 'Modelo C', 2021, 'Operacional'),
	(4, '1234567', 'Colheitadeira', 'Modelo D', 2019, 'Operacional'),
	(5, '1234567', 'Caminhão Pipa', 'Modelo E', 2022, 'Operacional');

-- Copiando estrutura para tabela agricultura_municipal.municipios
DROP TABLE IF EXISTS `municipios`;
CREATE TABLE IF NOT EXISTS `municipios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) NOT NULL,
  `nome` varchar(120) NOT NULL,
  `estado` varchar(2) DEFAULT NULL,
  `regiao` varchar(50) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo_ibge` (`codigo_ibge`)
) ENGINE=InnoDB AUTO_INCREMENT=285 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.municipios: ~142 rows (aproximadamente)
DELETE FROM `municipios`;
INSERT INTO `municipios` (`id`, `codigo_ibge`, `nome`, `estado`, `regiao`, `ativo`, `created_at`) VALUES
	(1, '5100102', 'Acorizal', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(2, '5100201', 'Água Boa', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(3, '5100250', 'Alta Floresta', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(4, '5100300', 'Alto Araguaia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(5, '5100359', 'Alto Boa Vista', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(6, '5100409', 'Alto Garças', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(7, '5100508', 'Alto Paraguai', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(8, '5100607', 'Alto Taquari', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(9, '5100805', 'Apiacás', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(10, '5101001', 'Araguaiana', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(11, '5101209', 'Araguainha', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(12, '5101258', 'Araputanga', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(13, '5101308', 'Arenápolis', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(14, '5101407', 'Aripuanã', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(15, '5101605', 'Barão de Melgaço', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(16, '5101704', 'Barra do Bugres', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(17, '5101803', 'Barra do Garças', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(18, '5101837', 'Boa Esperança do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(19, '5101852', 'Bom Jesus do Araguaia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(20, '5101902', 'Brasnorte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(21, '5102504', 'Cáceres', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(22, '5102603', 'Campinápolis', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(23, '5102637', 'Campo Novo do Parecis', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(24, '5102678', 'Campo Verde', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(25, '5102686', 'Campos de Júlio', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(26, '5102694', 'Canabrava do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(27, '5102702', 'Canarana', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(28, '5102793', 'Carlinda', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(29, '5102850', 'Castanheira', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(30, '5103007', 'Chapada dos Guimarães', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(31, '5103056', 'Cláudia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(32, '5103106', 'Cocalinho', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(33, '5103205', 'Colíder', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(34, '5103254', 'Colniza', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(35, '5103304', 'Comodoro', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(36, '5103353', 'Confresa', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(37, '5103361', 'Conquista D\'Oeste', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(38, '5103379', 'Cotriguaçu', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(39, '5103403', 'Cuiabá', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(40, '5103437', 'Curvelândia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(41, '5103452', 'Denise', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(42, '5103502', 'Diamantino', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(43, '5103601', 'Dom Aquino', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(44, '5103700', 'Feliz Natal', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(45, '5103809', 'Figueirópolis D\'Oeste', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(46, '5103858', 'Gaúcha do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(47, '5103908', 'General Carneiro', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(48, '5103957', 'Glória D\'Oeste', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(49, '5104104', 'Guarantã do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(50, '5104203', 'Guiratinga', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(51, '5104500', 'Indiavaí', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(52, '5104526', 'Ipiranga do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(53, '5104542', 'Itanhangá', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(54, '5104559', 'Itaúba', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(55, '5104609', 'Itiquira', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(56, '5104807', 'Jaciara', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(57, '5104906', 'Jangada', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(58, '5105002', 'Jauru', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(59, '5105101', 'Juara', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(60, '5105150', 'Juína', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(61, '5105176', 'Juruena', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(62, '5105200', 'Juscimeira', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(63, '5105234', 'Lambari D\'Oeste', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(64, '5105259', 'Lucas do Rio Verde', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(65, '5105309', 'Luciara', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(66, '5105507', 'Vila Bela da Santíssima Trindade', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(67, '5105580', 'Marcelândia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(68, '5105606', 'Matupá', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(69, '5105622', 'Mirassol d\'Oeste', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(70, '5105903', 'Nobres', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(71, '5106000', 'Nortelândia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(72, '5106109', 'Nossa Senhora do Livramento', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(73, '5106158', 'Nova Bandeirantes', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(74, '5106174', 'Nova Nazaré', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(75, '5106182', 'Nova Lacerda', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(76, '5106190', 'Nova Santa Helena', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(77, '5106208', 'Nova Brasilândia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(78, '5106216', 'Nova Canaã do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(79, '5106224', 'Nova Mutum', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(80, '5106232', 'Nova Olímpia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(81, '5106240', 'Nova Ubiratã', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(82, '5106257', 'Nova Xavantina', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(83, '5106265', 'Novo Mundo', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(84, '5106273', 'Novo Horizonte do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(85, '5106281', 'Novo São Joaquim', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(86, '5106299', 'Paranaíta', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(87, '5106307', 'Paranatinga', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(88, '5106315', 'Novo Santo Antônio', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(89, '5106372', 'Pedra Preta', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(90, '5106422', 'Peixoto de Azevedo', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(91, '5106455', 'Planalto da Serra', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(92, '5106505', 'Poconé', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(93, '5106653', 'Pontal do Araguaia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(94, '5106703', 'Ponte Branca', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(95, '5106752', 'Pontes e Lacerda', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(96, '5106778', 'Porto Alegre do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(97, '5106802', 'Porto dos Gaúchos', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(98, '5106828', 'Porto Esperidião', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(99, '5106851', 'Porto Estrela', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(100, '5107008', 'Poxoréu', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(101, '5107040', 'Primavera do Leste', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(102, '5107065', 'Querência', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(103, '5107107', 'São José dos Quatro Marcos', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(104, '5107156', 'Reserva do Cabaçal', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(105, '5107180', 'Ribeirão Cascalheira', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(106, '5107198', 'Ribeirãozinho', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(107, '5107206', 'Rio Branco', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(108, '5107248', 'Santa Carmem', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(109, '5107263', 'Santo Afonso', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(110, '5107297', 'São José do Povo', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(111, '5107305', 'São José do Rio Claro', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(112, '5107354', 'São José do Xingu', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(113, '5107404', 'São Pedro da Cipa', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(114, '5107578', 'Rondolândia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(115, '5107602', 'Rondonópolis', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(116, '5107701', 'Rosário Oeste', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(117, '5107743', 'Santa Cruz do Xingu', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(118, '5107750', 'Salto do Céu', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(119, '5107768', 'Santa Rita do Trivelato', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(120, '5107776', 'Santa Terezinha', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(121, '5107792', 'Santo Antônio do Leste', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(122, '5107800', 'Santo Antônio de Leverger', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(123, '5107859', 'São Félix do Araguaia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(124, '5107875', 'Sapezal', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(125, '5107883', 'Serra Nova Dourada', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(126, '5107909', 'Sinop', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(127, '5107925', 'Sorriso', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(128, '5107941', 'Tabaporã', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(129, '5107958', 'Tangará da Serra', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(130, '5108006', 'Tapurah', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(131, '5108055', 'Terra Nova do Norte', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(132, '5108105', 'Tesouro', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(133, '5108204', 'Torixoréu', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(134, '5108303', 'União do Sul', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(135, '5108352', 'Vale de São Domingos', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(136, '5108402', 'Várzea Grande', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(137, '5108501', 'Vera', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(138, '5108600', 'Vila Rica', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(139, '5108808', 'Nova Guarita', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(140, '5108857', 'Nova Marilândia', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(141, '5108907', 'Nova Maringá', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41'),
	(142, '5108956', 'Nova Monte Verde', 'MT', 'Centro-Oeste', 1, '2026-03-06 21:19:41');

-- Copiando estrutura para tabela agricultura_municipal.notificacoes
DROP TABLE IF EXISTS `notificacoes`;
CREATE TABLE IF NOT EXISTS `notificacoes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `mensagem` text DEFAULT NULL,
  `lida` tinyint(1) DEFAULT 0,
  `data` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `notificacoes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.notificacoes: ~0 rows (aproximadamente)
DELETE FROM `notificacoes`;

-- Copiando estrutura para tabela agricultura_municipal.operadores
DROP TABLE IF EXISTS `operadores`;
CREATE TABLE IF NOT EXISTS `operadores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.operadores: ~0 rows (aproximadamente)
DELETE FROM `operadores`;

-- Copiando estrutura para tabela agricultura_municipal.participantes_evento
DROP TABLE IF EXISTS `participantes_evento`;
CREATE TABLE IF NOT EXISTS `participantes_evento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `evento_id` int(11) DEFAULT NULL,
  `produtor_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `evento_id` (`evento_id`),
  KEY `produtor_id` (`produtor_id`),
  CONSTRAINT `participantes_evento_ibfk_1` FOREIGN KEY (`evento_id`) REFERENCES `eventos` (`id`),
  CONSTRAINT `participantes_evento_ibfk_2` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.participantes_evento: ~0 rows (aproximadamente)
DELETE FROM `participantes_evento`;

-- Copiando estrutura para tabela agricultura_municipal.produtores
DROP TABLE IF EXISTS `produtores`;
CREATE TABLE IF NOT EXISTS `produtores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(120) DEFAULT NULL,
  `sexo` varchar(10) DEFAULT NULL,
  `caf_dap` varchar(50) DEFAULT NULL,
  `associacao_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_produtores_ibge` (`codigo_ibge`),
  KEY `associacao_id` (`associacao_id`),
  CONSTRAINT `produtores_ibfk_1` FOREIGN KEY (`associacao_id`) REFERENCES `associacoes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.produtores: ~5 rows (aproximadamente)
DELETE FROM `produtores`;
INSERT INTO `produtores` (`id`, `codigo_ibge`, `nome`, `cpf`, `data_nascimento`, `telefone`, `email`, `sexo`, `caf_dap`, `associacao_id`, `created_at`) VALUES
	(1, '1234567', 'José da Silva', '111.111.111-11', NULL, '99999-9999', NULL, NULL, NULL, NULL, '2026-03-06 21:16:43'),
	(2, '1234567', 'Maria Oliveira', '222.222.222-22', NULL, '99999-9999', NULL, NULL, NULL, NULL, '2026-03-06 21:16:43'),
	(3, '1234567', 'Antônio Santos', '333.333.333-33', NULL, '99999-9999', NULL, NULL, NULL, NULL, '2026-03-06 21:16:43'),
	(4, '1234567', 'Ana Pereira', '444.444.444-44', NULL, '99999-9999', NULL, NULL, NULL, NULL, '2026-03-06 21:16:43'),
	(5, '1234567', 'Pedro Costa', '555.555.555-55', NULL, '99999-9999', NULL, NULL, NULL, NULL, '2026-03-06 21:16:43');

-- Copiando estrutura para tabela agricultura_municipal.programa_produtores
DROP TABLE IF EXISTS `programa_produtores`;
CREATE TABLE IF NOT EXISTS `programa_produtores` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `programa_id` int(11) DEFAULT NULL,
  `produtor_id` int(11) DEFAULT NULL,
  `beneficio` varchar(150) DEFAULT NULL,
  `valor` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `programa_id` (`programa_id`),
  KEY `produtor_id` (`produtor_id`),
  CONSTRAINT `programa_produtores_ibfk_1` FOREIGN KEY (`programa_id`) REFERENCES `programas` (`id`),
  CONSTRAINT `programa_produtores_ibfk_2` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.programa_produtores: ~0 rows (aproximadamente)
DELETE FROM `programa_produtores`;

-- Copiando estrutura para tabela agricultura_municipal.programas
DROP TABLE IF EXISTS `programas`;
CREATE TABLE IF NOT EXISTS `programas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `orgao` varchar(150) DEFAULT NULL,
  `data_inicio` date DEFAULT NULL,
  `data_fim` date DEFAULT NULL,
  `orcamento` decimal(12,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_programa_ibge` (`codigo_ibge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.programas: ~0 rows (aproximadamente)
DELETE FROM `programas`;

-- Copiando estrutura para tabela agricultura_municipal.propriedade_culturas
DROP TABLE IF EXISTS `propriedade_culturas`;
CREATE TABLE IF NOT EXISTS `propriedade_culturas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `propriedade_id` int(11) DEFAULT NULL,
  `cultura_id` int(11) DEFAULT NULL,
  `area_plantada` decimal(10,2) DEFAULT NULL,
  `safra` varchar(20) DEFAULT NULL,
  `producao_estimada` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pc_ibge` (`codigo_ibge`),
  KEY `propriedade_id` (`propriedade_id`),
  KEY `cultura_id` (`cultura_id`),
  CONSTRAINT `propriedade_culturas_ibfk_1` FOREIGN KEY (`propriedade_id`) REFERENCES `propriedades` (`id`),
  CONSTRAINT `propriedade_culturas_ibfk_2` FOREIGN KEY (`cultura_id`) REFERENCES `culturas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.propriedade_culturas: ~0 rows (aproximadamente)
DELETE FROM `propriedade_culturas`;

-- Copiando estrutura para tabela agricultura_municipal.propriedade_sistemas
DROP TABLE IF EXISTS `propriedade_sistemas`;
CREATE TABLE IF NOT EXISTS `propriedade_sistemas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `propriedade_id` int(11) DEFAULT NULL,
  `sistema_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `propriedade_id` (`propriedade_id`),
  KEY `sistema_id` (`sistema_id`),
  CONSTRAINT `propriedade_sistemas_ibfk_1` FOREIGN KEY (`propriedade_id`) REFERENCES `propriedades` (`id`),
  CONSTRAINT `propriedade_sistemas_ibfk_2` FOREIGN KEY (`sistema_id`) REFERENCES `sistemas_producao` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.propriedade_sistemas: ~0 rows (aproximadamente)
DELETE FROM `propriedade_sistemas`;

-- Copiando estrutura para tabela agricultura_municipal.propriedades
DROP TABLE IF EXISTS `propriedades`;
CREATE TABLE IF NOT EXISTS `propriedades` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `produtor_id` int(11) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `area_total` decimal(10,2) DEFAULT NULL,
  `area_produtiva` decimal(10,2) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `tipo` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prop_ibge` (`codigo_ibge`),
  KEY `produtor_id` (`produtor_id`),
  KEY `tipo` (`tipo`),
  CONSTRAINT `propriedades_ibfk_1` FOREIGN KEY (`produtor_id`) REFERENCES `produtores` (`id`),
  CONSTRAINT `propriedades_ibfk_2` FOREIGN KEY (`tipo`) REFERENCES `tipos_propriedade` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.propriedades: ~5 rows (aproximadamente)
DELETE FROM `propriedades`;
INSERT INTO `propriedades` (`id`, `codigo_ibge`, `produtor_id`, `nome`, `area_total`, `area_produtiva`, `latitude`, `longitude`, `tipo`) VALUES
	(1, '1234567', 1, 'Propriedade 1', 44.07, NULL, NULL, NULL, NULL),
	(2, '1234567', 2, 'Propriedade 2', 11.08, NULL, NULL, NULL, NULL),
	(3, '1234567', 3, 'Propriedade 3', 11.56, NULL, NULL, NULL, NULL),
	(4, '1234567', 4, 'Propriedade 4', 39.52, NULL, NULL, NULL, NULL),
	(5, '1234567', 5, 'Propriedade 5', 54.30, NULL, NULL, NULL, NULL);

-- Copiando estrutura para tabela agricultura_municipal.recomendacoes_tecnicas
DROP TABLE IF EXISTS `recomendacoes_tecnicas`;
CREATE TABLE IF NOT EXISTS `recomendacoes_tecnicas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `atendimento_id` int(11) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `atendimento_id` (`atendimento_id`),
  CONSTRAINT `recomendacoes_tecnicas_ibfk_1` FOREIGN KEY (`atendimento_id`) REFERENCES `atendimentos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.recomendacoes_tecnicas: ~0 rows (aproximadamente)
DELETE FROM `recomendacoes_tecnicas`;

-- Copiando estrutura para tabela agricultura_municipal.relatorios_gerados
DROP TABLE IF EXISTS `relatorios_gerados`;
CREATE TABLE IF NOT EXISTS `relatorios_gerados` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) DEFAULT NULL,
  `tipo` varchar(100) DEFAULT NULL,
  `data` timestamp NOT NULL DEFAULT current_timestamp(),
  `arquivo` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `relatorios_gerados_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.relatorios_gerados: ~0 rows (aproximadamente)
DELETE FROM `relatorios_gerados`;

-- Copiando estrutura para tabela agricultura_municipal.sistemas_producao
DROP TABLE IF EXISTS `sistemas_producao`;
CREATE TABLE IF NOT EXISTS `sistemas_producao` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.sistemas_producao: ~0 rows (aproximadamente)
DELETE FROM `sistemas_producao`;

-- Copiando estrutura para tabela agricultura_municipal.tecnicos
DROP TABLE IF EXISTS `tecnicos`;
CREATE TABLE IF NOT EXISTS `tecnicos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `formacao` varchar(120) DEFAULT NULL,
  `registro` varchar(100) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_tecnico_ibge` (`codigo_ibge`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.tecnicos: ~0 rows (aproximadamente)
DELETE FROM `tecnicos`;

-- Copiando estrutura para tabela agricultura_municipal.tipos_atendimento
DROP TABLE IF EXISTS `tipos_atendimento`;
CREATE TABLE IF NOT EXISTS `tipos_atendimento` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(120) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.tipos_atendimento: ~5 rows (aproximadamente)
DELETE FROM `tipos_atendimento`;
INSERT INTO `tipos_atendimento` (`id`, `descricao`) VALUES
	(1, 'Assistência Técnica'),
	(2, 'Visita de Rotina'),
	(3, 'Entrega de Insumos'),
	(4, 'Análise de Solo'),
	(5, 'Vistoria');

-- Copiando estrutura para tabela agricultura_municipal.tipos_propriedade
DROP TABLE IF EXISTS `tipos_propriedade`;
CREATE TABLE IF NOT EXISTS `tipos_propriedade` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `descricao` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.tipos_propriedade: ~0 rows (aproximadamente)
DELETE FROM `tipos_propriedade`;

-- Copiando estrutura para tabela agricultura_municipal.usuarios
DROP TABLE IF EXISTS `usuarios`;
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `codigo_ibge` varchar(10) DEFAULT NULL,
  `nome` varchar(150) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `senha_hash` varchar(255) DEFAULT NULL,
  `perfil` varchar(50) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT 1,
  `ultimo_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_usuario_ibge` (`codigo_ibge`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Copiando dados para a tabela agricultura_municipal.usuarios: ~2 rows (aproximadamente)
DELETE FROM `usuarios`;
INSERT INTO `usuarios` (`id`, `codigo_ibge`, `nome`, `email`, `senha_hash`, `perfil`, `telefone`, `ativo`, `ultimo_login`, `created_at`) VALUES
	(1, NULL, 'Administrador', 'admin@sgaf.com', '$2b$10$.7GVy47/OIRmnG/eDt6XWuQncAAaZG8b9a4O8lzEiCjVzPepMU7Ee', 'ADMIN_ESTADO', NULL, 1, NULL, '2026-03-06 21:16:43'),
	(2, '1234567', 'Técnico João', 'joao@sgaf.com', '$2b$10$.7GVy47/OIRmnG/eDt6XWuQncAAaZG8b9a4O8lzEiCjVzPepMU7Ee', 'tecnico', NULL, 1, NULL, '2026-03-06 21:16:43');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
