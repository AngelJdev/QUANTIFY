CREATE DATABASE IF NOT EXISTS quantify_db;
USE quantify_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    security_phrase_hash VARCHAR(255),
    rol ENUM('USER', 'ADMIN') DEFAULT 'USER',
    current_streak INT DEFAULT 0,
    max_streak INT DEFAULT 0,
    last_login_date DATE,
    preferencias JSON,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    mes_logro VARCHAR(50),
    icono_url VARCHAR(255),
    fecha_obtencion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS habits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_medicion ENUM('BOOLEANO', 'NUMERICO', 'TIEMPO') NOT NULL DEFAULT 'BOOLEANO',
    meta_diaria DECIMAL(10,2),
    unidad VARCHAR(50),
    frecuencia ENUM('DIARIO', 'SEMANAL', 'PERSONALIZADO') DEFAULT 'DIARIO',
    fecha_fin DATE,
    duracion_tipo VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indices
CREATE INDEX idx_habits_usuario_id ON habits(usuario_id);
CREATE INDEX idx_users_email ON users(email);

-- Usuario admin y de prueba inicial (La clave es 'password123' usando bcrypt)
-- Hasheado para demostración: $2a$10$3k.wAUMVj28g2eP0s.t8P.D19hUvP/l9/p9yP9N20G8.v/qT/KxG6
INSERT IGNORE INTO users (nombre, email, password_hash, rol) VALUES 
('Administrador', 'admin@quantify.test', '$2a$10$3k.wAUMVj28g2eP0s.t8P.D19hUvP/l9/p9yP9N20G8.v/qT/KxG6', 'ADMIN'),
('Usuario Demo', 'demo@quantify.test', '$2a$10$3k.wAUMVj28g2eP0s.t8P.D19hUvP/l9/p9yP9N20G8.v/qT/KxG6', 'USER');
