-- ==============================================================================
-- QUANTIFY — Esquema Estrella para Data Warehouse Analítico
-- ==============================================================================
-- Etapa 6 del Proyecto Integrador.
-- Propósito: Diseño dimensional para análisis y extracción de conocimiento
--            a partir de la telemetría conductual y biométrica de usuarios.
--
-- Esquema: Estrella (Star Schema)
-- Granularidad: Un registro por usuario por período de medición (snapshot).
-- ==============================================================================

-- ============================================================================
-- DIMENSIÓN: dim_tiempo
-- Descripción: Representa el período temporal de cada medición.
-- ============================================================================
CREATE TABLE IF NOT EXISTS dim_tiempo (
    tiempo_id           INT AUTO_INCREMENT PRIMARY KEY,
    fecha               DATE NOT NULL,
    dia_semana          VARCHAR(15) NOT NULL,       -- Lunes, Martes, etc.
    dia_mes             INT NOT NULL,               -- 1-31
    semana_anio         INT NOT NULL,               -- 1-52
    mes                 INT NOT NULL,               -- 1-12
    nombre_mes          VARCHAR(15) NOT NULL,       -- Enero, Febrero, etc.
    trimestre           INT NOT NULL,               -- 1-4
    anio                INT NOT NULL,
    es_fin_semana       BOOLEAN NOT NULL DEFAULT FALSE,
    es_dia_festivo      BOOLEAN NOT NULL DEFAULT FALSE
);

-- ============================================================================
-- DIMENSIÓN: dim_usuario
-- Descripción: Atributos descriptivos del usuario para segmentación.
-- ============================================================================
CREATE TABLE IF NOT EXISTS dim_usuario (
    usuario_dim_id      INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id          VARCHAR(20) NOT NULL UNIQUE, -- USR-XXXXX
    edad                INT NOT NULL,
    grupo_edad          VARCHAR(20) NOT NULL,        -- Joven (16-24), Adulto (25-40), Senior (41+)
    genero              VARCHAR(15) NOT NULL,
    dispositivo         VARCHAR(20) NOT NULL,
    fecha_registro      DATE,
    es_premium          BOOLEAN DEFAULT FALSE,
    cluster_id          INT                          -- Resultado del modelo no supervisado (K-Means)
);

-- ============================================================================
-- DIMENSIÓN: dim_habito
-- Descripción: Catálogo de tipos de hábito y su configuración.
-- ============================================================================
CREATE TABLE IF NOT EXISTS dim_habito (
    habito_dim_id       INT AUTO_INCREMENT PRIMARY KEY,
    tipo_medicion       VARCHAR(15) NOT NULL,        -- BOOLEANO, NUMERICO, TIEMPO
    frecuencia          VARCHAR(15) NOT NULL,        -- DIARIO, SEMANAL, PERSONALIZADO
    categoria           VARCHAR(30),                 -- Salud, Productividad, Fitness, etc.
    unidad              VARCHAR(20),                 -- minutos, páginas, litros, etc.
    meta_promedio       DECIMAL(10,2)
);

-- ============================================================================
-- DIMENSIÓN: dim_dispositivo
-- Descripción: Características del dispositivo utilizado para registrar.
-- ============================================================================
CREATE TABLE IF NOT EXISTS dim_dispositivo (
    dispositivo_dim_id  INT AUTO_INCREMENT PRIMARY KEY,
    tipo                VARCHAR(20) NOT NULL,        -- Web, Smartwatch, Web+Smartwatch
    sistema_operativo   VARCHAR(30),                 -- WearOS, iOS, Android, Browser
    tiene_sensores      BOOLEAN DEFAULT FALSE,       -- Si el dispositivo tiene sensores biométricos
    modelo              VARCHAR(50)
);

-- ============================================================================
-- DIMENSIÓN: dim_nivel_riesgo
-- Descripción: Catálogo de niveles de riesgo de abandono.
-- ============================================================================
CREATE TABLE IF NOT EXISTS dim_nivel_riesgo (
    riesgo_dim_id       INT AUTO_INCREMENT PRIMARY KEY,
    nivel               VARCHAR(10) NOT NULL UNIQUE, -- Bajo, Medio, Alto
    descripcion         VARCHAR(200) NOT NULL,
    umbral_inferior     DECIMAL(5,4),
    umbral_superior     DECIMAL(5,4),
    accion_recomendada  VARCHAR(200)
);

-- Carga de datos de dimensión de riesgo
INSERT INTO dim_nivel_riesgo (nivel, descripcion, umbral_inferior, umbral_superior, accion_recomendada) VALUES
('Bajo',  'Usuario con adherencia estable, baja fricción y estrés controlado',    0.6500, 1.0000, 'Mantener rutina actual, gamificación estándar'),
('Medio', 'Usuario con señales mixtas de adherencia o fricción moderada',          0.4000, 0.6499, 'Activar recordatorios adaptativos y reducir metas temporalmente'),
('Alto',  'Usuario con alta probabilidad de abandonar en los próximos 7 días',     0.0000, 0.3999, 'Alerta urgente, intervención de Gemini AI con tono empático');

-- ============================================================================
-- TABLA DE HECHOS: fact_user_telemetry
-- ============================================================================
-- Granularidad: Un registro por usuario por snapshot de telemetría.
-- Cada fila representa el estado acumulado de un usuario en un momento dado.
-- ============================================================================
CREATE TABLE IF NOT EXISTS fact_user_telemetry (
    fact_id                     BIGINT AUTO_INCREMENT PRIMARY KEY,

    -- Claves foráneas a dimensiones
    usuario_dim_id              INT NOT NULL,
    tiempo_id                   INT NOT NULL,
    habito_dim_id               INT,
    dispositivo_dim_id          INT,
    riesgo_dim_id               INT,

    -- ==========================================
    -- MEDIDAS CONDUCTUALES
    -- ==========================================
    dias_activo                 INT NOT NULL DEFAULT 0,
    tasa_adherencia             DECIMAL(6,4) NOT NULL,
    friccion_promedio           DECIMAL(5,2) NOT NULL,
    racha_maxima                INT NOT NULL DEFAULT 0,
    frecuencia_fallo_semanal    DECIMAL(4,1) NOT NULL,
    tendencia_crecimiento       DECIMAL(5,3),

    -- ==========================================
    -- MEDIDAS BIOMÉTRICAS
    -- ==========================================
    horas_sueno                 DECIMAL(4,1),
    pasos_diarios               INT,
    fc_media                    DECIMAL(5,1),
    spo2_promedio               DECIMAL(5,1),
    nivel_estres                INT,

    -- ==========================================
    -- MEDIDAS DE INFERENCIA ML
    -- ==========================================
    riesgo_predicho             VARCHAR(10),           -- Resultado del modelo supervisado
    probabilidad_riesgo         DECIMAL(5,4),          -- Confianza de la predicción
    cluster_asignado            INT,                   -- Resultado del modelo no supervisado
    distancia_centroide         DECIMAL(8,4),          -- Distancia al centroide del cluster
    modelo_version              VARCHAR(30),           -- Versión del modelo utilizado
    fecha_inferencia            TIMESTAMP,

    -- ==========================================
    -- METADATOS
    -- ==========================================
    fecha_carga                 TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Relaciones
    FOREIGN KEY (usuario_dim_id) REFERENCES dim_usuario(usuario_dim_id),
    FOREIGN KEY (tiempo_id) REFERENCES dim_tiempo(tiempo_id),
    FOREIGN KEY (habito_dim_id) REFERENCES dim_habito(habito_dim_id),
    FOREIGN KEY (dispositivo_dim_id) REFERENCES dim_dispositivo(dispositivo_dim_id),
    FOREIGN KEY (riesgo_dim_id) REFERENCES dim_nivel_riesgo(riesgo_dim_id)
);

-- ============================================================================
-- ÍNDICES PARA CONSULTAS ANALÍTICAS
-- ============================================================================
CREATE INDEX idx_fact_usuario ON fact_user_telemetry(usuario_dim_id);
CREATE INDEX idx_fact_tiempo ON fact_user_telemetry(tiempo_id);
CREATE INDEX idx_fact_riesgo ON fact_user_telemetry(riesgo_dim_id);
CREATE INDEX idx_fact_cluster ON fact_user_telemetry(cluster_asignado);
CREATE INDEX idx_dim_usuario_cluster ON dim_usuario(cluster_id);
CREATE INDEX idx_dim_tiempo_fecha ON dim_tiempo(fecha);

-- ============================================================================
-- VISTA ANALÍTICA: Resumen de riesgo por segmento
-- ============================================================================
CREATE OR REPLACE VIEW vw_risk_summary AS
SELECT
    du.grupo_edad,
    du.genero,
    du.dispositivo,
    dnr.nivel AS nivel_riesgo,
    COUNT(*) AS total_usuarios,
    AVG(ft.tasa_adherencia) AS adherencia_promedio,
    AVG(ft.friccion_promedio) AS friccion_promedio,
    AVG(ft.nivel_estres) AS estres_promedio,
    AVG(ft.racha_maxima) AS racha_maxima_promedio
FROM fact_user_telemetry ft
JOIN dim_usuario du ON ft.usuario_dim_id = du.usuario_dim_id
JOIN dim_nivel_riesgo dnr ON ft.riesgo_dim_id = dnr.riesgo_dim_id
GROUP BY du.grupo_edad, du.genero, du.dispositivo, dnr.nivel;
