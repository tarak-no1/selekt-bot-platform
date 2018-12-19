-- MySQL dump 10.13  Distrib 5.7.21, for Linux (x86_64)
--
-- Host: localhost    Database: bot_platform
-- ------------------------------------------------------
-- Server version	5.7.21-0ubuntu0.16.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `bot_details`
--

DROP TABLE IF EXISTS `bot_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `bot_details` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `client_identifier` int(45) NOT NULL,
  `fb_access_token` longtext NOT NULL,
  `page_identifier` varchar(45) NOT NULL,
  `bot_type` varchar(45) NOT NULL,
  `bot_name` varchar(45) NOT NULL,
  `timestamp` varchar(45) NOT NULL,
  `country` varchar(45) NOT NULL,
  `inventory_status` varchar(45) NOT NULL DEFAULT '0',
  `launch_time` varchar(45) NOT NULL DEFAULT '1 day',
  `working_status` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `client_identifier` (`client_identifier`),
  CONSTRAINT `bot_details_ibfk_1` FOREIGN KEY (`client_identifier`) REFERENCES `client_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=150 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bot_details`
--

LOCK TABLES `bot_details` WRITE;
/*!40000 ALTER TABLE `bot_details` DISABLE KEYS */;
INSERT INTO `bot_details` VALUES (140,78,'EAAEtZAkA3XQUBAH5liPpxOxXjW4wUGpMv6XsUchRxXHxcZA7hn7XHxcQyWi9eGAc1U5hDbezp5SxSYjZAXm0En4thMo6p26afhaHrMgHZCW77lMjuQaRWiZBPcGFPW3a0GjXXxe5Ky7NiEVurXvFOsxMcqN7r5hovhdNMCZAeRZBimCtRjwJZBr7POJsSuFh50TOS1JMhyrmDAZDZD','145248099469018','fashion','fashion','1516197134217','India','0','2 Days',1),(141,72,'EAAEtZAkA3XQUBADnqPZC5KWI3VWal1ieRsmhgjL1IMw5UAZBrhXywDQYnlnJaX4EJDqmD8d8GamOHZAB4l0u15AwB7owP0WhyP03RCRApfWLZBiNi4FCr4izITRgmz9VrBPEomeiJtgw16fAaZB6HIi6ppYZBlhH4uiQSiimK4elsNXg96b1JlOVKhiLjz7RcoZD','228855037645535','fashion','fashion','1516200368813','Other','1','2 Days',1),(146,74,'EAAEtZAkA3XQUBAN8U4PnBPmbqP4oz90O9bZB1TWzPxzLHbr3wGzjXUCsvhFQnUSU5zjKvet6boH25hZAqZBZAt0mtNZB56msOW6XgpuyQRvOpQqHmK4PECTHFRrDOD5p7zzGppIvYPul2wNNA5fY6IUZCOJUbLQwEbpHTmMob5xwfEI8BExL3m4iFqaGGlZAJT0UpVPvmWlwXgZDZD','1785589268369706','fashion','fashion','1516303031130','India','1','1 day',0),(149,76,'EAAEtZAkA3XQUBAKyNhMtSKSG3EutKFY9SsitPxnKU8NzYNfsCkXG7sXX5UkrhETuv6jvU1DuYIEr5QyVzgOKZAe889DHF0avLPCwFNhbxVMbmTEB6iNlUPoLISt6jz9el37huXYCl5z82T2m3FsVZCTm2OnvZBolytJRtVRlA8hi6meR3R7ridU4dfoCwZAgZD','161660794245721','fashion','fashion','1516461001278','India','1','1 day',0);
/*!40000 ALTER TABLE `bot_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_page_exists_status` AFTER
INSERT ON `bot_details` FOR EACH ROW
BEGIN UPDATE `client_fb_pages` SET is_already_connected = 1 WHERE
page_identifier=NEW.page_identifier;  
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `update_page_connection_status` AFTER
UPDATE ON `bot_details` FOR EACH ROW
BEGIN UPDATE `client_fb_pages` SET is_already_connected = 0 WHERE
page_identifier not in (SELECT `page_identifier` FROM `bot_details` WHERE page_identifier=NEW.page_identifier);
UPDATE `client_fb_pages` SET is_already_connected = 1 WHERE
page_identifier in (SELECT `page_identifier` FROM `bot_details` WHERE page_identifier=NEW.page_identifier);  
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_delete_update_page_connection_status` AFTER
DELETE ON `bot_details` FOR EACH ROW
BEGIN UPDATE `client_fb_pages` SET is_already_connected = 0 WHERE
page_identifier not in (SELECT `page_identifier` FROM `bot_details`);
UPDATE `client_fb_pages` SET is_already_connected = 1 WHERE
page_identifier in (SELECT `page_identifier` FROM `bot_details`);  
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `client_details`
--

DROP TABLE IF EXISTS `client_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_details` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `timestamp` varchar(45) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `verification_status` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=85 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_details`
--

LOCK TABLES `client_details` WRITE;
/*!40000 ALTER TABLE `client_details` DISABLE KEYS */;
INSERT INTO `client_details` VALUES (72,'456tarakesh@gmail.com','dGFyYWtlc2g=','1516169822322','Tarakesh',1),(74,'karnamit2105@gmail.com','cGFzc3dvcmQ=','1516169946701','Selekt.in',1),(76,'1234tarakesh@gmail.com','dGFyYWs=','1516176681934','Tarakesh',1),(77,'dsp2202@gmail.com','YXNzYWluc2NyZWVkMQ==','1516177309833','DSP',1),(78,'saemahesh@gmail.com','MTExMjIy','1516197090797','Mahesh',1),(79,'suvindh.sudevan@gmail.com','dGVzdEAxMjM=','1517403275829','Test',1);
/*!40000 ALTER TABLE `client_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_fb_login_details`
--

DROP TABLE IF EXISTS `client_fb_login_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_fb_login_details` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `username` varchar(45) NOT NULL DEFAULT '',
  `fb_id` varchar(45) NOT NULL,
  `login_status` int(1) NOT NULL DEFAULT '0',
  `timestamp` varchar(45) NOT NULL,
  `client_identifier` int(45) NOT NULL,
  `profile_image` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `client_identifier` (`client_identifier`),
  CONSTRAINT `client_fb_login_details_ibfk_1` FOREIGN KEY (`client_identifier`) REFERENCES `client_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_fb_login_details`
--

LOCK TABLES `client_fb_login_details` WRITE;
/*!40000 ALTER TABLE `client_fb_login_details` DISABLE KEYS */;
INSERT INTO `client_fb_login_details` VALUES (40,'Tarakesh Cse','1043736459107269',1,'1517495804228',72,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/23905762_1020130488134533_5519397806151509080_n.jpg?oh=c69bb9d662cec3d9af685914e3a096f8&oe=5AE6BF8F'),(41,'Amit Kumar Karn','1993797283981571',1,'1516302811967',74,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/26229614_1992262840801682_9065454681503409671_n.jpg?oh=7eb96753bbb3e3efd3a4575db4f9bc69&oe=5AFC6503'),(43,'Sai Mahesh','1341030475997465',1,'1516197130921',78,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/18446710_1143797702387411_1580163899728489633_n.jpg?oh=b58a095773f416aef5e996941bebf46e&oe=5ADD1DA8'),(44,'Tarakesh Cse','1043736459107269',0,'1516628715634',76,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/23905762_1020130488134533_5519397806151509080_n.jpg?oh=c69bb9d662cec3d9af685914e3a096f8&oe=5AE6BF8F');
/*!40000 ALTER TABLE `client_fb_login_details` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_fb_pages`
--

DROP TABLE IF EXISTS `client_fb_pages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `client_fb_pages` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `fb_user_identifier` int(45) NOT NULL,
  `page_name` varchar(100) NOT NULL,
  `access_token` text NOT NULL,
  `page_identifier` varchar(45) NOT NULL,
  `is_already_connected` int(1) NOT NULL DEFAULT '0',
  `image_url` text NOT NULL,
  `is_available` int(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  KEY `fb_user_identifier` (`fb_user_identifier`),
  CONSTRAINT `client_fb_pages_ibfk_1` FOREIGN KEY (`fb_user_identifier`) REFERENCES `client_fb_login_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=172 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_fb_pages`
--

LOCK TABLES `client_fb_pages` WRITE;
/*!40000 ALTER TABLE `client_fb_pages` DISABLE KEYS */;
INSERT INTO `client_fb_pages` VALUES (149,40,'Selekt.in','EAAEtZAkA3XQUBAHjUMLLvl9VbKMARERZCJfm7vPitwUcJfyMI9YDdL6uOCidKsZCxlpfvszwtVg4Le1FeUriO2FNAZCTnKY0jLbmdbcnXoqwOsTmkqTFy2SGox0Nc6VRDIOQz6wjCeAVlSIMYf0jaGmZAJeEBcMh0VEza67a3gGB5izPpNmJR','1895037644101272',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/17424853_1915678872037149_5705098270473103323_n.jpg?oh=1f51fc08c2991db6a87b4498234513c2&oe=5AE73DEC',1),(150,40,'My games','EAAEtZAkA3XQUBAGFxaAjUAydcKF6QZB47ZAbDMpSrCUNSb5Lc7b2W0V7zlbqXR4S5SdZATMirYST0IlE3ZB3wTyBHcZC3ZAgZAoWWd4igN2TbbNSfDkohPSLZA6X9KXc5AYeO0TPHGbOlRuxanJKfORy4X5eZAs9Pk5shzSHfOdxVKMSCc2uZBLEZBPd','1152493044886352',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/26239929_1152493111553012_771490120253468071_n.png?oh=add201f1131752bf124c0c430430fd07&oe=5AF2DC4F',1),(151,40,'Coders','EAAEtZAkA3XQUBAJMSTUylOkNq6pf2BoZADti7YR3KiZCBAZBZBHog07hFr16mdHA33CBPZC0iN9VPTTMnWtWAMigBZByRjjhm52jL8TR1M0E3iyTmbWtgQYgG1ZCaK9YZAvU8PH6qYrrSLZCpMMgmfRZAMqUbV7Gb4qdOHBSDu3x9kbaQZDZD','161660794245721',1,'https://scontent.xx.fbcdn.net/v/t1.0-1/c13.0.50.50/p50x50/13615329_161715024240298_29586076860158862_n.png?oh=99241bcde9179f8bcb66b17d7aaf3cde&oe=5B256BF4',1),(152,40,'Selekt_test','EAAEtZAkA3XQUBAN6h1mTrHXZCKkHVzsY3paSjWEdwxVNykJ2xxZAQX5JLbFsWUhZCEBcb6VmyAZBKSZCd71cZC0yUNk0Dfs9OZAq2IL5azQ3zV05Nlv821uC4RLwgSQlRyAcvFNnO1KLXRUZCCWkObBDcTFKv3wHxqOhUpxFJCKc5ZC0K4NE5ekO8x','1999356953677323',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/24991602_1999357023677316_1110185094204557122_n.png?oh=108b27fd6e1f424c1b97ee5418d7de07&oe=5AE840B3',1),(153,40,'Its me','EAAEtZAkA3XQUBAC1TYFZB3lZCOyOG6iOvlY4HHR7ZB7xqUFYDf337rhEZCbNfdKpI73ApxfZAGFEEuLZBKXwEX9up3Wnp0xFFCIAaJs1yeiPa1jzhXOX3ZAZCMtbEePZAIvMv2L7Y9gk5nZAWve15TZBdT7ZBzjCBFd1iuqaxZB3HcSZBgZC1wZDZD','228855037645535',1,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/24129733_248609399003432_7675284147495267916_n.jpg?oh=3481353cf12405b88487a7e817ce5efc&oe=5ADAC2D5',1),(154,40,'Wit-bot','EAAEtZAkA3XQUBAK1IzwYOPthOu8E7BiXd5YbwXZAfiQhGVY8YFeBVLvaEWC1KkxqenZBoZCt4xNMhQeNvv0YepxXM9gFhXigEdrwnmh2SH1d0lP0UlEHOltu9d81F9yeoKsw2hzeqUMtdxT3tDDoM5pEt7xnbpZBNNOnSHKY3OJxm5c7g0TOZA','1132247936907323',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/22448486_1136195543179229_8791208826896271580_n.png?oh=cb4aa6c7d589530725d91c7f29aff334&oe=5AE1AC40',1),(155,40,'Airtel Demo Bot','EAAEtZAkA3XQUBAPz3ohy4ajTR1unbs3iZCmBqKjyn6dwLT4pnDgpbOMogtKqy2ZCrZBJcdVDvfhSZA2QHnLSlpufZArPNgl4LaZC5xXSFPEhCSBfSayJs3gZC8vHkWtA3nbrNb7uPuerBlo6TYmYYAGtjDq4IqPpIiAacdPpLaBgKXdmwQSHYD89','1465892260153105',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/22228458_1465892323486432_1934453194328600896_n.png?oh=3110e4db81d0499c81cf92f30d976787&oe=5AFD6E1B',1),(156,40,'Tarak085','EAAEtZAkA3XQUBAJCblpLJRGkGDFRTpwnnKtS2vZCD5rZCfxugfcvHXaPUobaGZApbBAe5A05FREs3LgiwfZBGF3G3ZBx2LMYMThNJjhT3LJ9XqmnD8LXuVlyDCngq5ctkzpM4vJq0BZCryz64barKCd9iYRMZBqfNAtwfDBFT1segmsZCaMXKdPLa','1908597649454569',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/26731783_1908597729454561_6341037963497310663_n.png?oh=ba6e937ea395e4829eb6d7dbdbabf22d&oe=5AFAB24A',0),(157,41,'Quest Again','EAAEtZAkA3XQUBAN8U4PnBPmbqP4oz90O9bZB1TWzPxzLHbr3wGzjXUCsvhFQnUSU5zjKvet6boH25hZAqZBZAt0mtNZB56msOW6XgpuyQRvOpQqHmK4PECTHFRrDOD5p7zzGppIvYPul2wNNA5fY6IUZCOJUbLQwEbpHTmMob5xwfEI8BExL3m4iFqaGGlZAJT0UpVPvmWlwXgZDZD','1785589268369706',1,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/16002893_1785590598369573_1494618979724864375_n.png?oh=771828a5994a2ab41b64410cfcf010d8&oe=5ADE6832',1),(158,41,'Hacker Diaries','EAAEtZAkA3XQUBAEeZC7jUxS9xCtBd4YpmNIA43i1VP3c8RVPt9rwYZCvvoUlZBotbayoU2GB2d9ZBZC5aZCattJ1qn6W4KEKnZBRWBOKJi0qB2FmZBoRqCnbR7ZASxymrh5TnDDUAZAeEZBkXNqZA9Hz3c5s3eP4nEYzu3EB19TOvbLbLZC69vl6pVTSMKLWyPZCNTGEMluoYEJerZAp4AZDZD','1776636365926367',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/13892300_1776637065926297_2844208687664165780_n.png?oh=4234bd954d7f04331be20b1f2666bfdd&oe=5ADDEBE7',1),(159,41,'Coders','EAAEtZAkA3XQUBAP5CC60ZAR6eX51LKQg1o0JMZA2QeFiB4EzjiZBBj3khKlTKQa0AduWRSsWlNz8x6ZA6hbbOX9ngo9cDpBZA5ZATnj4HVkI8JvDfZA8UcuZBRNMH6LIJZBqrhZCmcP0Pp29tJYzbrhe9XWmS7gxLqdb3eMZC1PAiw3gsNO90bKZAc61ParMsuCSXECIZD','161660794245721',1,'https://scontent.xx.fbcdn.net/v/t1.0-1/c13.0.50.50/p50x50/13615329_161715024240298_29586076860158862_n.png?oh=32cdfed2e16c2e2693242fa428c6fe6c&oe=5AFDDEF4',1),(160,43,'Mahesh','EAAEtZAkA3XQUBAH5liPpxOxXjW4wUGpMv6XsUchRxXHxcZA7hn7XHxcQyWi9eGAc1U5hDbezp5SxSYjZAXm0En4thMo6p26afhaHrMgHZCW77lMjuQaRWiZBPcGFPW3a0GjXXxe5Ky7NiEVurXvFOsxMcqN7r5hovhdNMCZAeRZBimCtRjwJZBr7POJsSuFh50TOS1JMhyrmDAZDZD','145248099469018',1,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/26167863_145248169469011_5083094137210205497_n.png?oh=2bc38b6abed3a6c5d8311af3e556f8e9&oe=5AF2E2DD',1),(161,43,'Test','EAAEtZAkA3XQUBAO2ZCVZCHK51P5fDZBfRSxHQj2WhU7nZBmnLUz8LYFUZBZALLtSzFK38RRXQPjrA1tcq21OEZB06QWPXV1mAYOPC0UbaD78HjqQfaZACMf0aZA3nTGem8iJd0nhU2C2khTZBPGXU9ibkRQWICuTn8oAqmU288FHHiGz1Os9bdvB525xVmgD32pzZCRdmLD3zoURBAZDZD','2071051886462548',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/26219700_2071051946462542_104504614591760652_n.png?oh=7401d9a434b04a92c436677f4ff220de&oe=5AF6EA33',1),(162,43,'Selekt.in','EAAEtZAkA3XQUBADZAqVCV2nyUnkPGn09aUhnwFK6bh5Nv7XVsJZA2kEcYawAQuZBXbvHs3jg0dyPB1cTs51Mge1JQtz8kKpGmlF8BqIAW1PAiOXxgZA4If4ny0Cy5A4CVaLJ1pFimd5ykyjXeuvZAWBgGSxTZCw0Vc2NZCeCshDEGJxWrr8nFEZA64zdkKJPg0wTb2xT6pvaZCpgZDZD','1895037644101272',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/17424853_1915678872037149_5705098270473103323_n.jpg?oh=1f51fc08c2991db6a87b4498234513c2&oe=5AE73DEC',1),(163,44,'My games','EAAEtZAkA3XQUBABkOWZA5Puum59hcGoq4uwyTOM8ZAu4m8QJL4r36y2r0ISqRRZBavcR439ZBdhJZAoQPIiDeYNHWvdqxDs2PDxhbBcOZCOetxYNZAF7QsycshaiamBOlLk5LIUhj2ZBpC3IWZAYgEZB51DGFZBRNKd9YQZCbnAHgIqCG1dAZCR41vZBT3vZAzIDPhVGFSRymJHU6VfjCAZDZD','1152493044886352',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/26239929_1152493111553012_771490120253468071_n.png?oh=add201f1131752bf124c0c430430fd07&oe=5AF2DC4F',1),(164,44,'Selekt.in','EAAEtZAkA3XQUBAAgmPNAx79fpp8nr65JZAaZAfZAcYqOf2Dvb1Tckip6zf7u3EA3FL403A8VEiJ7FfeKmAo9qnJgH1vzHAglcPR53jfZBpZBs8dH7wDYsHM41ZBcgwq3K28SwkgKUQeZA2BHgRTsva5plcyZAp5zQri9MgmwdgnHktxssPPNM6oqAxnSCoVOY2K4FYagZCGYYfCwZDZD','1895037644101272',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/17424853_1915678872037149_5705098270473103323_n.jpg?oh=1f51fc08c2991db6a87b4498234513c2&oe=5AE73DEC',1),(165,44,'Coders','EAAEtZAkA3XQUBAKyNhMtSKSG3EutKFY9SsitPxnKU8NzYNfsCkXG7sXX5UkrhETuv6jvU1DuYIEr5QyVzgOKZAe889DHF0avLPCwFNhbxVMbmTEB6iNlUPoLISt6jz9el37huXYCl5z82T2m3FsVZCTm2OnvZBolytJRtVRlA8hi6meR3R7ridU4dfoCwZAgZD','161660794245721',1,'https://scontent.xx.fbcdn.net/v/t1.0-1/c13.0.50.50/p50x50/13615329_161715024240298_29586076860158862_n.png?oh=99241bcde9179f8bcb66b17d7aaf3cde&oe=5B256BF4',1),(166,44,'Its me','EAAEtZAkA3XQUBADnqPZC5KWI3VWal1ieRsmhgjL1IMw5UAZBrhXywDQYnlnJaX4EJDqmD8d8GamOHZAB4l0u15AwB7owP0WhyP03RCRApfWLZBiNi4FCr4izITRgmz9VrBPEomeiJtgw16fAaZB6HIi6ppYZBlhH4uiQSiimK4elsNXg96b1JlOVKhiLjz7RcoZD','228855037645535',1,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/24129733_248609399003432_7675284147495267916_n.jpg?oh=3481353cf12405b88487a7e817ce5efc&oe=5ADAC2D5',1),(167,44,'Airtel Demo Bot','EAAEtZAkA3XQUBAKJwrbif6HuF4SyRgoFxzauqLDynfUQi3lkSZCZCcrZAhcEvWvNkCnjPjxLlmhXAuLBbKDFfapvTtZAjXrO3zOVVKRGwZBccvBsvw2qPTsOH6L90SJbHpqCtQmSrUtvyi3pQkoTBiGvz9QISZAZBZBH2ZAWmoIpoZBfdwPAttPgXOtBZBqGXGCKctjEugWCR04hzgZDZD','1465892260153105',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/22228458_1465892323486432_1934453194328600896_n.png?oh=1da0ebffa584eda69f9244bf8eb15e09&oe=5B24FB1B',1),(168,44,'Wit-bot','EAAEtZAkA3XQUBAJzISUn3tVXQErPjEkGnet7zMfeGf7sRCzGO3ZC2qIMFoAIWfNLnyK03oOfSjkRkxWUvrcn3nY3jxhcddJ2eppb6ZAK6jBBusfArxZAZBHzEjLB9WUOZC2yc4XDMZAI7Jcv7R08wQd1pXyl7Ee4ND7LOCPXAexsPn0ZB93nGuUkwANOA0QhtJmqIpQ6JJHvigZDZD','1132247936907323',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/22448486_1136195543179229_8791208826896271580_n.png?oh=cb4aa6c7d589530725d91c7f29aff334&oe=5AE1AC40',1),(169,44,'Tarak085','EAAEtZAkA3XQUBAGXG5xw2ZAUYPtvaviZCnQLZCIs6VChvVVgMTrp7R6ODIZAdQNelv9pVeeLlwwnKpRULCTwBqtJyW93ZBipx88xfToDsggAhreJIF09VZBxixZA1iYZCjETg9SHBuHEDfAZATGGZBaZCO4GRhIQZCaGGlXX6MpDVQDQfud4AZAqTVsZCf70wzPbkBV7sRY6c7p23TjIQZDZD','1908597649454569',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/26731783_1908597729454561_6341037963497310663_n.png?oh=ba6e937ea395e4829eb6d7dbdbabf22d&oe=5AFAB24A',1),(170,44,'Selekt_test','EAAEtZAkA3XQUBAP6mCMegZAqv6CE1izioYuL8UBZCZCrihXwz3DdeL1eVBlfZAc0oN6fVGTooy3NeWZBlP6yVA0yPwlcOZBIYGJzn5ZBxrviZCg9LIyqZCZBCzZAO7M0OKvOd9sfRqijjFDmZAZB4oIj0xJQbib04F03xj1QnLpqmWsFHIlyJzPb4ZCsjlEyJ6JQWDQ6ibxldRndcie3gZDZD','1999356953677323',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/24991602_1999357023677316_1110185094204557122_n.png?oh=108b27fd6e1f424c1b97ee5418d7de07&oe=5AE840B3',1),(171,40,'Lifestyle-test-bot','EAAEtZAkA3XQUBADHdnGZCDSgVAlRCrQB32ejM8pcXZAu4ktyNfDvoq74X0f4hoQgsaIBT5tBnbjTIdEhkjswOsziZBeFPwKZBQWw5DXGjPa2YLS7pZAss2bit83edZCpW6I5ZBICByUtc2MCtFI6at7lJBC2qoiQzeJlFoj8LCxN4oZAJsW1ddIZCsS9MeKryDzGcmXMZBZCZAlieMAZDZD','1905707836407388',0,'https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/26908068_1905707893074049_1217191594184734913_n.png?oh=f4c2eed4f08a997bcafbaa1e9441b274&oe=5AD9F57F',1);
/*!40000 ALTER TABLE `client_fb_pages` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `contact_us`
--

DROP TABLE IF EXISTS `contact_us`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `contact_us` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `bot_identifier` int(45) NOT NULL,
  `email` varchar(100) NOT NULL DEFAULT '',
  `message` text NOT NULL,
  `timestamp` varchar(45) NOT NULL,
  `message_from` varchar(5) NOT NULL DEFAULT 'user',
  PRIMARY KEY (`id`),
  KEY `bot_identifier` (`bot_identifier`),
  CONSTRAINT `contact_us_ibfk_1` FOREIGN KEY (`bot_identifier`) REFERENCES `bot_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `contact_us`
--

LOCK TABLES `contact_us` WRITE;
/*!40000 ALTER TABLE `contact_us` DISABLE KEYS */;
INSERT INTO `contact_us` VALUES (10,141,'456tarakesh@gmail.com','how to live the bot','1516428503617','user'),(11,141,'','follow this link https://developers.facebook.com','1516428579138','admin'),(12,141,'','hi','1516432852739','admin');
/*!40000 ALTER TABLE `contact_us` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `inventory`
--

DROP TABLE IF EXISTS `inventory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `inventory` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `bot_identifier` int(45) NOT NULL,
  `inventory_name` varchar(45) NOT NULL,
  `deals_status` varchar(45) NOT NULL,
  `contact_number` varchar(45) NOT NULL,
  `timestamp` varchar(45) NOT NULL,
  `initial_update_status` int(1) NOT NULL DEFAULT '1',
  `live_on` varchar(45) NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `bot_identifier` (`bot_identifier`),
  CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`bot_identifier`) REFERENCES `bot_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `inventory`
--

LOCK TABLES `inventory` WRITE;
/*!40000 ALTER TABLE `inventory` DISABLE KEYS */;
INSERT INTO `inventory` VALUES (49,141,'osnovnoi_products_20180108_110504.xml','true','undefined','1516200422136',1,'1516200422136'),(54,146,'VERSION.TXT','true','undefined','1516303044087',0,'1516450475311'),(56,149,'- (1).js','false','undefined','1516461546429',0,'1516545575191');
/*!40000 ALTER TABLE `inventory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_details`
--

DROP TABLE IF EXISTS `user_details`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user_details` (
  `id` int(45) NOT NULL AUTO_INCREMENT,
  `bot_identifier` int(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `fb_id` varchar(45) NOT NULL,
  `timestamp` varchar(45) NOT NULL,
  `last_visit` varchar(45) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `bot_identifier` (`bot_identifier`),
  CONSTRAINT `user_details_ibfk_1` FOREIGN KEY (`bot_identifier`) REFERENCES `bot_details` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_details`
--

LOCK TABLES `user_details` WRITE;
/*!40000 ALTER TABLE `user_details` DISABLE KEYS */;
INSERT INTO `user_details` VALUES (13,141,'undefined','undefined','1511028975655905','1516200481461','1516432935190');
/*!40000 ALTER TABLE `user_details` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2018-02-05  6:30:27
