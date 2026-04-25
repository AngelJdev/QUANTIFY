-- QUANTIFY SECURITY AUDIT SYSTEM (Senior DBA Implementation)
-- Este script crea la infraestructura necesaria para la auditoría de integridad referencial y seguridad.

USE quantify_db;

-- 1. Crear tabla de Bitácora de Seguridad
CREATE TABLE IF NOT EXISTS SecurityAuditLogs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tabla_afectada VARCHAR(50) NOT NULL,
    registro_id INT NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    valor_anterior JSON,
    valor_nuevo JSON,
    usuario_db VARCHAR(100),
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Trigger para Auditoría de ACTUALIZACIONES en Usuarios
DROP TRIGGER IF EXISTS after_user_update;
DELIMITER //
CREATE TRIGGER after_user_update
AFTER UPDATE ON Users
FOR EACH ROW
BEGIN
    INSERT INTO SecurityAuditLogs (tabla_afectada, registro_id, accion, valor_anterior, valor_nuevo, usuario_db)
    VALUES (
        'Users', 
        OLD.id, 
        'UPDATE', 
        JSON_OBJECT('email', OLD.email, 'rol', OLD.rol, 'username', OLD.username, 'current_streak', OLD.current_streak),
        JSON_OBJECT('email', NEW.email, 'rol', NEW.rol, 'username', NEW.username, 'current_streak', NEW.current_streak),
        USER()
    );
END //
DELIMITER ;

-- 3. Trigger para Auditoría de ELIMINACIONES en Usuarios
DROP TRIGGER IF EXISTS after_user_delete;
DELIMITER //
CREATE TRIGGER after_user_delete
AFTER DELETE ON Users
FOR EACH ROW
BEGIN
    INSERT INTO SecurityAuditLogs (tabla_afectada, registro_id, accion, valor_anterior, usuario_db)
    VALUES (
        'Users', 
        OLD.id, 
        'DELETE', 
        JSON_OBJECT('nombre', OLD.nombre, 'email', OLD.email, 'rol', OLD.rol),
        USER()
    );
END //
DELIMITER ;

-- 4. Justificación Técnica:
-- El uso de triggers garantiza que la auditoría ocurra a nivel de motor de base de datos, 
-- siendo imposible de saltar mediante bypass de la lógica del backend (Node.js).
