-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: banco_tcc
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- -----------------------------------------------------
-- Schema banco_tcc
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema banco_tcc
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `banco_tcc` DEFAULT CHARACTER SET utf8 ;
USE `banco_tcc` ;

-- -----------------------------------------------------
-- Table `banco_tcc`.`usuarios`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `banco_tcc`.`usuarios` ;

CREATE TABLE IF NOT EXISTS `banco_tcc`.`usuarios` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(200) NOT NULL,
  `cpf` VARCHAR(11) NOT NULL,
  `email` VARCHAR(200) NULL,
  `telefone` VARCHAR(200) NULL,
  `senha` VARCHAR(200) NOT NULL,
  `foto_perfil` VARCHAR(200) NULL,
  PRIMARY KEY (`id`),
  KEY `fk_comentarios_usuarios1_idx` (`usuarios_id`),
  KEY `fk_comentarios_postagens1_idx` (`postagens_id`),
  CONSTRAINT `fk_comentarios_postagens1` FOREIGN KEY (`postagens_id`) REFERENCES `postagens` (`id`),
  CONSTRAINT `fk_comentarios_usuarios1` FOREIGN KEY (`usuarios_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `postagens`
--

DROP TABLE IF EXISTS `postagens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `postagens` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tipo_postagem` enum('denuncia','doação','adoção') NOT NULL,
  `titulo` varchar(150) NOT NULL,
  `descricao` text NOT NULL,
  `raca` varchar(150) DEFAULT NULL,
  `genero` enum('feminino','masculino','desconhecido') DEFAULT NULL,
  `idade` int DEFAULT NULL,
  `foto` varchar(200) DEFAULT NULL,
  `data_criacao` date NOT NULL,
  `usuarios_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_postagens_usuarios_idx` (`usuarios_id`),
  CONSTRAINT `fk_postagens_usuarios` FOREIGN KEY (`usuarios_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(200) NOT NULL,
  `cpf` varchar(11) NOT NULL,
  `email` varchar(200) DEFAULT NULL,
  `telefone` varchar(200) DEFAULT NULL,
  `senha` varchar(200) NOT NULL,
  `foto_perfil` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cpf_UNIQUE` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-11 15:13:37
