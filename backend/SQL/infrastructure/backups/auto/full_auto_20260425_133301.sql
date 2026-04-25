-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: quantify_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `achievements`
--

DROP TABLE IF EXISTS `achievements`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `achievements` (
  `id` int NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text,
  `mes_logro` varchar(255) DEFAULT NULL,
  `icono_url` varchar(255) DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `fecha_obtencion` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `achievements_usuario_id_titulo_mes_logro` (`titulo`,`mes_logro`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `achievements_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_10` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_11` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_4` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_5` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_6` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_7` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_8` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `achievements_ibfk_9` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `achievements`
--

LOCK TABLES `achievements` WRITE;
/*!40000 ALTER TABLE `achievements` DISABLE KEYS */;
INSERT INTO `achievements` VALUES (16,'Arquitecto de Hábitos 🏗️','Has configurado tu primer sistema de ingeniería personal.','Abril','🏗️',5,'2026-04-20 19:52:12'),(17,'Fuego Eterno 🔥','Has mantenido una racha de más de 15 días.','Abril','🔥',5,'2026-04-20 19:52:12'),(18,'Alquimista de Datos ⚗️','Has procesado más de 30 registros bio-sincrónicos.','Abril','⚗️',5,'2026-04-20 19:52:12'),(19,'Chispa Inicial 🔥','Primeros 3 días de racha. ¡El motor ha arrancado!','April 2026','⚡',5,'2026-04-20 19:52:38');
/*!40000 ALTER TABLE `achievements` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bitacora`
--

DROP TABLE IF EXISTS `bitacora`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora` (
  `id` int NOT NULL AUTO_INCREMENT,
  `operacion` enum('INSERT','DELETE') NOT NULL,
  `ip` varchar(45) NOT NULL,
  `descripcion` text NOT NULL,
  `fecha_hora` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bitacora`
--

LOCK TABLES `bitacora` WRITE;
/*!40000 ALTER TABLE `bitacora` DISABLE KEYS */;
INSERT INTO `bitacora` VALUES (1,'INSERT','::1','Población SQL: 10 usuarios insertados | Filtros: ocupacion=PROGRAMADOR','2026-04-25 15:14:30');
/*!40000 ALTER TABLE `bitacora` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `habits`
--

DROP TABLE IF EXISTS `habits`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `habits` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text,
  `tipo_medicion` enum('BOOLEANO','NUMERICO','TIEMPO') NOT NULL DEFAULT 'BOOLEANO',
  `meta_diaria` decimal(10,2) DEFAULT NULL,
  `unidad` varchar(50) DEFAULT NULL,
  `frecuencia` enum('DIARIO','SEMANAL','PERSONALIZADO') DEFAULT 'DIARIO',
  `activo` tinyint(1) DEFAULT '1',
  `fecha_creacion` datetime NOT NULL,
  `fecha_fin` datetime DEFAULT NULL,
  `duracion_tipo` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `habits_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_10` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_11` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_4` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_5` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_6` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_7` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_8` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `habits_ibfk_9` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `habits`
--

LOCK TABLES `habits` WRITE;
/*!40000 ALTER TABLE `habits` DISABLE KEYS */;
INSERT INTO `habits` VALUES (20,2,'Meditar','Meditación mindful para reducir el estrés','BOOLEANO',15.00,'Minutos','DIARIO',1,'2026-04-20 17:58:30','2026-05-20 17:58:30','1_MES'),(21,2,'Tomar Agua','Mantener la hidratación diaria','BOOLEANO',2.00,'Litros','DIARIO',1,'2026-04-20 17:58:38','2026-05-20 17:58:38','1_MES'),(22,4,'Caminar','Salir a caminar y completar pasos','BOOLEANO',10.00,'Kilómetros','DIARIO',1,'2026-04-20 18:52:25','2026-05-20 18:52:25','1_MES'),(23,1,'Leer','Fomentar el hábito de la lectura','BOOLEANO',20.00,'Páginas','DIARIO',1,'2026-04-20 19:00:21','2026-05-20 19:00:21','1_MES'),(24,1,'Caminar 30 min',NULL,'BOOLEANO',NULL,'SESIÓN','DIARIO',1,'2026-04-20 19:09:02',NULL,NULL),(47,5,'Tomar Agua','Mantener la hidratación diaria','BOOLEANO',2.00,'Litros','DIARIO',1,'2026-04-20 20:07:56','2026-04-21 20:07:56','1_DIA'),(48,5,'Leer','Fomentar el hábito de la lectura','BOOLEANO',150.00,'Páginas','DIARIO',1,'2026-04-20 20:08:11','2026-04-27 20:08:11','1_SEMANA'),(49,5,'Caminar','Salir a caminar y completar pasos','BOOLEANO',10.00,'Kilómetros','DIARIO',1,'2026-04-20 20:08:24','2026-04-27 20:08:24','1_SEMANA'),(50,5,'Meditar','Meditación mindful para reducir el estrés','BOOLEANO',15.00,'Minutos','DIARIO',1,'2026-04-20 20:10:46','2026-04-21 20:10:46','1_DIA'),(51,5,'Tomar Agua','Mantener la hidratación diaria','BOOLEANO',10.00,'Litros','DIARIO',1,'2026-04-20 20:25:16','2026-10-20 20:25:16','6_MESES'),(52,5,'Caminar','Salir a caminar y completar pasos','BOOLEANO',10.00,'Kilómetros','DIARIO',1,'2026-04-20 20:33:08','2026-05-20 20:33:08','1_MES'),(53,2,'Estudiar','mejorar mi habilidad en UX','BOOLEANO',30.00,'Minutos','DIARIO',1,'2026-04-20 22:15:34','2026-05-20 22:15:34','1_MES'),(54,1,'Tomar Agua','Mantener la hidratación diaria','BOOLEANO',2.00,'Litros','DIARIO',1,'2026-04-20 22:30:37','2026-05-20 22:30:37','1_MES'),(55,1,'Caminar','Salir a caminar y completar pasos','BOOLEANO',10.00,'Kilómetros','DIARIO',1,'2026-04-20 22:30:40','2026-05-20 22:30:40','1_MES'),(57,6,'Leer','Fomentar el hábito de la lectura','BOOLEANO',20.00,'Páginas','DIARIO',1,'2026-04-21 19:22:52','2026-05-21 19:22:52','1_MES');
/*!40000 ALTER TABLE `habits` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `securityauditlogs`
--

DROP TABLE IF EXISTS `securityauditlogs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `securityauditlogs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tabla_afectada` varchar(50) NOT NULL,
  `registro_id` int NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `valor_anterior` json DEFAULT NULL,
  `valor_nuevo` json DEFAULT NULL,
  `usuario_db` varchar(100) DEFAULT NULL,
  `fecha_cambio` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `securityauditlogs`
--

LOCK TABLES `securityauditlogs` WRITE;
/*!40000 ALTER TABLE `securityauditlogs` DISABLE KEYS */;
INSERT INTO `securityauditlogs` VALUES (1,'Users',1,'UPDATE','{\"rol\": 2, \"email\": \"admin@quantify.test\", \"username\": null, \"current_streak\": 0}','{\"rol\": 2, \"email\": \"admin@quantify.test\", \"username\": \"DBA_Senior_Admin\", \"current_streak\": 0}','root@localhost','2026-04-25 19:18:59');
/*!40000 ALTER TABLE `securityauditlogs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_metrics`
--

DROP TABLE IF EXISTS `user_metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `edad` int NOT NULL,
  `peso` decimal(5,2) NOT NULL,
  `estatura` int NOT NULL,
  `genero` enum('MASCULINO','FEMENINO','OTRO') NOT NULL,
  `nivel_actividad` enum('SEDENTARIO','LIGERO','MODERADO','ACTIVO','MUY_ACTIVO') NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `user_metrics_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_metrics`
--

LOCK TABLES `user_metrics` WRITE;
/*!40000 ALTER TABLE `user_metrics` DISABLE KEYS */;
INSERT INTO `user_metrics` VALUES (1,1,30,78.50,180,'MASCULINO','ACTIVO','2026-04-20 18:47:16'),(2,3,26,99.00,181,'MASCULINO','MODERADO','2026-04-20 18:50:00'),(3,4,26,85.00,172,'MASCULINO','SEDENTARIO','2026-04-20 18:52:18'),(12,5,28,75.00,175,'MASCULINO','MODERADO','2026-04-20 19:52:11'),(13,2,19,88.00,177,'MASCULINO','ACTIVO','2026-04-20 20:21:03'),(14,6,21,55.00,165,'FEMENINO','SEDENTARIO','2026-04-21 19:22:45'),(15,7,20,80.00,170,'OTRO','SEDENTARIO','2026-04-21 23:27:30');
/*!40000 ALTER TABLE `user_metrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usermetrics`
--

DROP TABLE IF EXISTS `usermetrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usermetrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `edad` int NOT NULL,
  `peso` decimal(5,2) NOT NULL,
  `estatura` int NOT NULL,
  `genero` enum('MASCULINO','FEMENINO','OTRO') NOT NULL,
  `nivel_actividad` enum('SEDENTARIO','LIGERO','MODERADO','ACTIVO','MUY_ACTIVO') NOT NULL,
  `discapacidad` enum('NINGUNA','MOTRIZ','VISUAL','AUDITIVA','INTELECTUAL','PSICOSOCIAL','DEL_HABLA','MULTIPLE') DEFAULT 'NINGUNA',
  `ocupacion` enum('ESTUDIANTE','EMPLEADO','FREELANCE','EMPRESARIO','DESEMPLEADO','JUBILADO','DOCENTE','MEDICO','INGENIERO','ABOGADO','CONTADOR','DISEÑADOR','PROGRAMADOR','COMERCIANTE','AGRICULTOR','ARTISTA','DEPORTISTA','INVESTIGADOR','AMA_DE_CASA','OTRO') DEFAULT 'ESTUDIANTE',
  `fecha_creacion` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `usermetrics_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_10` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_11` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_3` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_4` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_5` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_6` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_7` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_8` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `usermetrics_ibfk_9` FOREIGN KEY (`usuario_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usermetrics`
--

LOCK TABLES `usermetrics` WRITE;
/*!40000 ALTER TABLE `usermetrics` DISABLE KEYS */;
INSERT INTO `usermetrics` VALUES (1,1,20,90.00,172,'MASCULINO','SEDENTARIO','NINGUNA','ESTUDIANTE','2026-04-24 07:04:58'),(2,8,25,75.00,175,'MASCULINO','ACTIVO','NINGUNA','PROGRAMADOR','2026-04-24 14:51:53'),(3,9,25,75.00,175,'MASCULINO','ACTIVO','NINGUNA','PROGRAMADOR','2026-04-24 14:51:54'),(4,10,25,75.00,175,'MASCULINO','ACTIVO','NINGUNA','PROGRAMADOR','2026-04-24 14:51:55'),(5,11,25,75.00,175,'MASCULINO','ACTIVO','NINGUNA','PROGRAMADOR','2026-04-24 14:51:56'),(6,12,33,62.60,185,'FEMENINO','MUY_ACTIVO','NINGUNA','PROGRAMADOR','2026-04-25 15:14:30'),(7,13,29,84.40,149,'FEMENINO','SEDENTARIO','NINGUNA','PROGRAMADOR','2026-04-25 15:14:30'),(8,14,25,66.70,179,'MASCULINO','MODERADO','NINGUNA','PROGRAMADOR','2026-04-25 15:14:30'),(9,15,46,80.30,173,'FEMENINO','LIGERO','NINGUNA','PROGRAMADOR','2026-04-25 15:14:30'),(10,16,44,59.50,157,'MASCULINO','MODERADO','NINGUNA','PROGRAMADOR','2026-04-25 15:14:30'),(11,17,43,69.60,165,'OTRO','MUY_ACTIVO','NINGUNA','PROGRAMADOR','2026-04-25 15:14:30'),(12,18,66,106.40,162,'MASCULINO','MODERADO','DEL_HABLA','PROGRAMADOR','2026-04-25 15:14:30'),(13,19,42,97.00,177,'FEMENINO','ACTIVO','NINGUNA','PROGRAMADOR','2026-04-25 15:14:30'),(14,20,42,106.00,195,'MASCULINO','LIGERO','MULTIPLE','PROGRAMADOR','2026-04-25 15:14:30'),(15,21,18,59.50,173,'MASCULINO','MUY_ACTIVO','NINGUNA','PROGRAMADOR','2026-04-25 15:14:30');
/*!40000 ALTER TABLE `usermetrics` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` int DEFAULT '1' COMMENT '0=ADMIN, 1=USER, 2=MODERADOR',
  `preferencias` json DEFAULT NULL,
  `fecha_creacion` datetime NOT NULL,
  `security_phrase_hash` varchar(255) DEFAULT NULL,
  `current_streak` int DEFAULT '0',
  `max_streak` int DEFAULT '0',
  `last_login_date` date DEFAULT NULL,
  `avatar_url` text,
  `pais` enum('México','Estados Unidos','Colombia','Argentina','España','Chile','Perú','Brasil','Ecuador','Venezuela','Guatemala','Cuba','Bolivia','Rep. Dominicana','Honduras','Paraguay','El Salvador','Costa Rica','Panamá','Uruguay') DEFAULT 'México',
  `username` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `email_2` (`email`),
  UNIQUE KEY `email_3` (`email`),
  UNIQUE KEY `email_4` (`email`),
  UNIQUE KEY `email_5` (`email`),
  UNIQUE KEY `email_6` (`email`),
  UNIQUE KEY `email_7` (`email`),
  UNIQUE KEY `email_8` (`email`),
  UNIQUE KEY `email_9` (`email`),
  UNIQUE KEY `email_10` (`email`),
  UNIQUE KEY `email_11` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Administrador','admin@quantify.test','$2a$10$BDaIs4LeZGgKg7Sy4qdaw.p3lU.MppUwhgENksApVImZ.k/SbOTvy',2,NULL,'2026-04-20 00:06:35',NULL,0,0,NULL,NULL,'México','DBA_Senior_Admin'),(2,'Angel de Jesus Baños','tellezangel292@gmail.com','$2a$10$LlGunMLjYXjh1E2S1N2SwOk/YHlPZIya0SzzS/qXc8kmKuqahDnmy',1,NULL,'2026-04-20 17:22:56',NULL,1,2,'2026-04-24',NULL,'México',NULL),(3,'Jesus Tellez','angel@gmail.com','$2a$10$F0ALOC12V6zeFxONzXDt/ObilzgGBr.cHbxA948nhlD1r283JmTU6',1,NULL,'2026-04-20 18:50:00','$2a$10$8a7T/oZK/49YoSaTadia1.G..2Q7h8KjWp5pxN3oq72i4OL1b1jDO',0,0,NULL,NULL,'México',NULL),(4,'jesus ','angelin@gmail.com','$2a$10$dz/jzTnVZVd/aFQu73SJuuoxc4uGx9GsSzbSoyMES2O9XLt7DoGqe',1,NULL,'2026-04-20 18:52:17','$2a$10$1cn/7upjWmEqFDwsbbejtuTM.QXLhIyQdPsk3IPKsI6arTd4xnRfe',0,0,NULL,NULL,'México',NULL),(5,'Admin Tester','admin_tester@quantify.ai','$2a$10$9YImHZLeMu07dm/iyV0TJO6g2nQ5o1HUF5SMC1vn3aaU1Qk7Lf//u',2,NULL,'2026-04-20 19:11:14',NULL,15,30,'2026-04-20',NULL,'México',NULL),(6,'artiaga','arti@gmail.com','$2a$10$Dfm91AkmAG9he/TCBjOpwOIJ3rQDypPhHuOM84mDLwu3W5a3cmQ16',1,NULL,'2026-04-21 19:22:45','$2a$10$0WOLBDZK/bBNxhgVpaZH4.K492l7P/Alk6q3ZSW.PxrcGbPEc/0yG',0,0,NULL,NULL,'México',NULL),(7,'adrian','adrian@gmail.com','$2a$10$E8usKTA5wThwS0cXfb2gaeLFM7b/dDLw4ki5I6y1x40Uf.EhZr5jW',1,NULL,'2026-04-21 23:27:29','$2a$10$CALV0bILL8acUt3M9K.SCOjADjvgEK0hQZ9oZ8ovw7qO4zSlA5mmK',0,0,NULL,NULL,'México',NULL),(8,'Farias','farias@quantify.ai','$2a$10$4pSdFFdpNeEPXOTUCyNoeOHUUNDhRsVKbkWOm5F/Ristf45Vrjq6m',0,NULL,'2026-04-24 14:51:51','$2a$10$Aymop2x.knGbfTf99.tZcelWPp/RFlPvCu0Z5Xynq5dGW.mV34PXm',0,0,NULL,NULL,'México',NULL),(9,'Artiaga','artiaga@quantify.ai','$2a$10$g01xWJl5mGTvdbOQvUnQlOnAapGZx7vGHl1uRUFmUKnaUvC96IOzS',0,NULL,'2026-04-24 14:51:53','$2a$10$acOIJ8mCIvaHXYtqZbHGsu3Srs.unVBStc/enQG2lUWt5jJetHC6a',0,0,NULL,NULL,'México',NULL),(10,'Angel','angel@quantify.ai','$2a$10$IXRqAttMaDSUXtlwyyqk6.BuaczqOutVyGUZqrw2ME2UIIY8Mn6ra',0,NULL,'2026-04-24 14:51:54','$2a$10$GdDfIG7EVubSryhb/eo8FeycWZcpd63B1TUXbbWUcIrNFwjEx7BiC',0,0,NULL,NULL,'México',NULL),(11,'Paco','paco@quantify.ai','$2a$10$HMBzAu3JjEuOP6dRn/BSBef67McpovI9EyBB9v5wYtxfljE6yZAmu',0,NULL,'2026-04-24 14:51:55','$2a$10$5gR27LLnw7C8mxRRAyys5exGouY8JKS0ziK8Y7c1GCAiiHpFZELgm',0,0,NULL,NULL,'México',NULL),(12,'Sofía Figueroa','sql_1777130070214_0@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Panamá','sofia702140'),(13,'Ana Gómez','sql_1777130070214_1@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Colombia','ana702141'),(14,'Jorge Domínguez','sql_1777130070214_2@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'El Salvador','jorge702142'),(15,'María Castillo','sql_1777130070214_3@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Argentina','maria702143'),(16,'Pablo Vega','sql_1777130070214_4@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Estados Unidos','pablo702144'),(17,'Iván Vega','sql_1777130070214_5@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Perú','ivan702145'),(18,'Gerardo Castillo','sql_1777130070214_6@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Paraguay','gerardo702146'),(19,'Alicia Castillo','sql_1777130070214_7@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Estados Unidos','alicia702147'),(20,'Juan Contreras','sql_1777130070214_8@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Chile','juan702148'),(21,'Gustavo Sánchez','sql_1777130070214_9@quantify-pop.test','$2a$10$mqlhN2EpFAsVNqTVie5gjuxwVgPcqvGT0RHr.k236wl7YWLrjjDfW',1,NULL,'2026-04-25 15:14:30','$2a$10$mqlhN2EpFAsVNqTVie5gjuT.8HDtAsOKTraLihkMxP.Mtk7xutDqq',0,0,NULL,NULL,'Honduras','gustavo702149');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_user_update` AFTER UPDATE ON `users` FOR EACH ROW BEGIN
    INSERT INTO SecurityAuditLogs (tabla_afectada, registro_id, accion, valor_anterior, valor_nuevo, usuario_db)
    VALUES (
        'Users', 
        OLD.id, 
        'UPDATE', 
        JSON_OBJECT('email', OLD.email, 'rol', OLD.rol, 'username', OLD.username, 'current_streak', OLD.current_streak),
        JSON_OBJECT('email', NEW.email, 'rol', NEW.rol, 'username', NEW.username, 'current_streak', NEW.current_streak),
        USER()
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = cp850 */ ;
/*!50003 SET character_set_results = cp850 */ ;
/*!50003 SET collation_connection  = cp850_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_user_delete` AFTER DELETE ON `users` FOR EACH ROW BEGIN
    INSERT INTO SecurityAuditLogs (tabla_afectada, registro_id, accion, valor_anterior, usuario_db)
    VALUES (
        'Users', 
        OLD.id, 
        'DELETE', 
        JSON_OBJECT('nombre', OLD.nombre, 'email', OLD.email, 'rol', OLD.rol),
        USER()
    );
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Dumping routines for database 'quantify_db'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-25 13:33:01
