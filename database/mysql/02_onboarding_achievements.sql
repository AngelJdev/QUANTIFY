CREATE TABLE IF NOT EXISTS user_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL UNIQUE,
    edad INT NOT NULL,
    peso DECIMAL(5,2) NOT NULL,
    estatura INT NOT NULL,
    genero ENUM('MASCULINO', 'FEMENINO', 'OTRO') NOT NULL,
    nivel_actividad ENUM('SEDENTARIO', 'LIGERO', 'MODERADO', 'ACTIVO', 'MUY_ACTIVO') NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    mes_logro VARCHAR(20) NOT NULL,
    icono_url VARCHAR(255),
    fecha_desbloqueo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_monthly_achievement (usuario_id, titulo, mes_logro)
);
