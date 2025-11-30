-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.0.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para emercado
CREATE DATABASE IF NOT EXISTS `emercado` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */;
USE `emercado`;

-- Volcando estructura para tabla emercado.carrito
CREATE TABLE IF NOT EXISTS `carrito` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `fecha_agregado` DATETIME NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla emercado.carrito: ~0 rows (aproximadamente)

-- Volcando estructura para tabla emercado.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id_categoria` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `productCount` int(11) DEFAULT NULL,
  `imgSrc` text DEFAULT NULL,
  PRIMARY KEY (`id_categoria`),
  KEY `idx_nombre` (`name`) USING BTREE
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorías de productos';

-- Volcando datos para la tabla emercado.categorias: ~9 rows (aproximadamente)
INSERT IGNORE INTO `categorias` (`id_categoria`, `name`, `description`, `productCount`, `imgSrc`) VALUES
	(101, NULL, NULL, NULL, NULL),
	(102, NULL, NULL, NULL, NULL),
	(103, NULL, NULL, NULL, NULL),
	(104, NULL, NULL, NULL, NULL),
	(105, NULL, NULL, NULL, NULL),
	(106, NULL, NULL, NULL, NULL),
	(107, NULL, NULL, NULL, NULL),
	(108, NULL, NULL, NULL, NULL),
	(109, NULL, NULL, NULL, NULL);

-- Volcando estructura para tabla emercado.comentarios
CREATE TABLE IF NOT EXISTS `comentarios` (
  `id_comentario` int(11) NOT NULL AUTO_INCREMENT,
  `id_producto` int(11) NOT NULL,
  `calificacion` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `fecha_comentario` datetime DEFAULT current_timestamp(),
  `id_usuario` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_comentario`),
  KEY `idx_producto` (`id_producto`),
  KEY `comentarios_id_usuario` (`id_usuario`),
  KEY `idx_calificacion` (`calificacion`) USING BTREE,
  KEY `idx_fecha` (`fecha_comentario`) USING BTREE,
  KEY `idx_comentarios_producto_fecha` (`id_producto`,`fecha_comentario` DESC) USING BTREE,
  CONSTRAINT `comentarios_id_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `comentarios_producto` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `CONSTRAINT_1` CHECK (`calificacion` between 1 and 5)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Comentarios y calificaciones de productos';

-- Volcando datos para la tabla emercado.comentarios: ~0 rows (aproximadamente)

-- Volcando estructura para tabla emercado.pedidos
CREATE TABLE IF NOT EXISTS `pedidos` (
  `id_pedido` int(11) NOT NULL AUTO_INCREMENT,
  `numero_pedido` varchar(50) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `estado` enum('pendiente','procesando','enviado','entregado','cancelado') NOT NULL DEFAULT 'pendiente',
  `fecha_pedido` datetime DEFAULT current_timestamp(),
  `id_usuario` int(11) NOT NULL,
  PRIMARY KEY (`id_pedido`),
  UNIQUE KEY `numero_pedido` (`numero_pedido`),
  KEY `idx_numero_pedido` (`numero_pedido`),
  KEY `idx_usuario` (`id_usuario`),
  KEY `idx_estado` (`estado`),
  KEY `idx_fecha_pedido` (`fecha_pedido`),
  KEY `idx_pedidos_usuario_fecha` (`id_usuario`,`fecha_pedido` DESC),
  CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`) ON UPDATE CASCADE,
  CONSTRAINT `CONSTRAINT_1` CHECK (`total` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pedidos realizados por los usuarios';

-- Volcando datos para la tabla emercado.pedidos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla emercado.pedido_detalles
CREATE TABLE IF NOT EXISTS `pedido_detalles` (
  `id_detalle` int(11) NOT NULL AUTO_INCREMENT,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `id_pedido` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  PRIMARY KEY (`id_detalle`),
  KEY `idx_pedido` (`id_pedido`),
  KEY `idx_producto` (`id_producto`),
  CONSTRAINT `pedido_detalles_ibfk_1` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `pedido_detalles_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id_producto`) ON UPDATE CASCADE,
  CONSTRAINT `CONSTRAINT_1` CHECK (`cantidad` > 0),
  CONSTRAINT `CONSTRAINT_2` CHECK (`precio_unitario` >= 0),
  CONSTRAINT `CONSTRAINT_3` CHECK (`subtotal` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Detalles de productos en cada pedido';

-- Volcando datos para la tabla emercado.pedido_detalles: ~0 rows (aproximadamente)

-- Volcando estructura para tabla emercado.productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id_producto` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `precio` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `vendidos` int(11) DEFAULT 0,
  `id_categoria` int(11) DEFAULT NULL,
  PRIMARY KEY (`id_producto`),
  KEY `idx_categoria` (`id_categoria`),
  KEY `idx_nombre` (`name`) USING BTREE,
  KEY `idx_precio` (`precio`) USING BTREE,
  KEY `idx_productos_categoria_precio` (`id_categoria`,`precio`) USING BTREE,
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id_categoria`) ON UPDATE CASCADE,
  CONSTRAINT `CONSTRAINT_1` CHECK (`precio` >= 0),
  CONSTRAINT `CONSTRAINT_3` CHECK (`vendidos` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Productos disponibles en la plataforma';

-- Volcando datos para la tabla emercado.productos: ~0 rows (aproximadamente)

-- Volcando estructura para tabla emercado.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `nombre_completo` varchar(255) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `ciudad` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `username` (`nombre_completo`),
  KEY `idx_email` (`email`),
  KEY `idx_ciudad` (`ciudad`),
  KEY `idx_fecha_registro` (`fecha_registro`),
  KEY `nombre_completo` (`nombre_completo`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuarios registrados en la plataforma';

-- Volcando datos para la tabla emercado.usuarios: ~1 rows (aproximadamente)
INSERT IGNORE INTO `usuarios` (`id_usuario`, `email`, `nombre_completo`, `password_hash`, `fecha_registro`, `ciudad`) VALUES
	(1, 'usuario@emercado.com', NULL, NULL, '2025-11-29 02:32:48', 'Maldonado');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
