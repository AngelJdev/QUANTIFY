/**
 * Data Generator - Shared business logic for population tests
 * Generates realistic user data respecting all ENUM constraints and age correlations
 */

// ─── NAME BANKS ───
const NOMBRES_M = ['Carlos','Miguel','José','Juan','Luis','Pedro','Diego','Andrés','Fernando','Ricardo','Alejandro','Daniel','Roberto','Eduardo','Francisco','Sergio','Manuel','Rafael','Arturo','Héctor','Guillermo','Óscar','Mario','Enrique','Raúl','Pablo','Jorge','Iván','David','Antonio','Marcos','Gerardo','Víctor','Emilio','Adrián','Santiago','Mateo','Sebastián','Leonardo','Tomás','Rodrigo','Ángel','Alberto','Javier','Marco','Gustavo','Joaquín','Bruno','Fabián','Esteban'];
const NOMBRES_F = ['María','Ana','Laura','Sofía','Gabriela','Valentina','Camila','Isabella','Fernanda','Daniela','Andrea','Lucía','Mariana','Paola','Diana','Elena','Claudia','Patricia','Teresa','Carolina','Alejandra','Natalia','Verónica','Rosa','Mónica','Silvia','Jessica','Adriana','Karla','Sandra','Lourdes','Beatriz','Alicia','Cecilia','Cristina','Guadalupe','Martha','Gloria','Yolanda','Regina','Romina','Renata','Catalina','Emilia','Ximena','Alma','Julia','Sara','Rebeca','Nadia'];
const APELLIDOS = ['García','Hernández','López','Martínez','González','Rodríguez','Pérez','Sánchez','Ramírez','Torres','Flores','Rivera','Gómez','Díaz','Cruz','Morales','Reyes','Gutiérrez','Ortiz','Ramos','Vargas','Castillo','Jiménez','Mendoza','Aguilar','Medina','Castro','Herrera','Ruiz','Vega','Rojas','Delgado','Salazar','Guerrero','Domínguez','Contreras','Figueroa','Acosta','Navarro','Molina'];

// ─── ENUM VALUES (must match models exactly) ───
export const PAISES = ['México','Estados Unidos','Colombia','Argentina','España','Chile','Perú','Brasil','Ecuador','Venezuela','Guatemala','Cuba','Bolivia','Rep. Dominicana','Honduras','Paraguay','El Salvador','Costa Rica','Panamá','Uruguay'];
export const GENEROS = ['MASCULINO','FEMENINO','OTRO'];
export const NIVELES_ACTIVIDAD = ['SEDENTARIO','LIGERO','MODERADO','ACTIVO','MUY_ACTIVO'];
export const DISCAPACIDADES = ['NINGUNA','MOTRIZ','VISUAL','AUDITIVA','INTELECTUAL','PSICOSOCIAL','DEL_HABLA','MULTIPLE'];
export const OCUPACIONES = ['ESTUDIANTE','EMPLEADO','FREELANCE','EMPRESARIO','DESEMPLEADO','JUBILADO','DOCENTE','MEDICO','INGENIERO','ABOGADO','CONTADOR','DISEÑADOR','PROGRAMADOR','COMERCIANTE','AGRICULTOR','ARTISTA','DEPORTISTA','INVESTIGADOR','AMA_DE_CASA','OTRO'];
export const PAISES_SUDAMERICA = ['Colombia','Argentina','Chile','Perú','Brasil','Ecuador','Venezuela','Bolivia','Paraguay','Uruguay'];
export const OCUPACIONES_PROFESIONALES = ['MEDICO','INGENIERO','ABOGADO','CONTADOR','DOCENTE','INVESTIGADOR'];

// ─── HELPERS ───
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Strip accents and special chars for username generation
const stripAccents = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

// ─── AGE CONSTRAINTS BY OCCUPATION ───
// If the test specifies an occupation, the age range is automatically constrained
const OCCUPATION_AGE_RANGES = {
    ESTUDIANTE:    { min: 13, max: 25 },
    EMPLEADO:      { min: 18, max: 65 },
    FREELANCE:     { min: 18, max: 70 },
    EMPRESARIO:    { min: 22, max: 70 },
    DESEMPLEADO:   { min: 18, max: 70 },
    JUBILADO:      { min: 56, max: 70 },
    DOCENTE:       { min: 22, max: 70 },
    MEDICO:        { min: 25, max: 70 },
    INGENIERO:     { min: 22, max: 70 },
    ABOGADO:       { min: 22, max: 70 },
    CONTADOR:      { min: 22, max: 70 },
    DISEÑADOR:     { min: 18, max: 70 },
    PROGRAMADOR:   { min: 18, max: 70 },
    COMERCIANTE:   { min: 18, max: 70 },
    AGRICULTOR:    { min: 16, max: 70 },
    ARTISTA:       { min: 13, max: 70 },
    DEPORTISTA:    { min: 13, max: 45 },
    INVESTIGADOR:  { min: 22, max: 70 },
    AMA_DE_CASA:   { min: 18, max: 70 },
    OTRO:          { min: 13, max: 70 }
};

/**
 * Resolves the effective age range considering:
 * 1. Explicit edad_min/edad_max from config (highest priority)
 * 2. Occupation-based constraint (if occupation is specified)
 * 3. Default global range (13-70)
 */
function resolveAgeRange(config) {
    let min = 13, max = 70;

    // If occupation is specified, apply its age constraint first
    if (config.ocupacion && OCCUPATION_AGE_RANGES[config.ocupacion]) {
        const range = OCCUPATION_AGE_RANGES[config.ocupacion];
        min = range.min;
        max = range.max;
    }

    // Explicit values from config override occupation constraints
    if (config.edad_min != null) min = config.edad_min;
    if (config.edad_max != null) max = config.edad_max;

    // Safety clamp
    min = Math.max(13, min);
    max = Math.min(70, max);
    if (min > max) min = max;

    return { min, max };
}

// ─── OCCUPATION RULES BY AGE ───
function getValidOccupation(edad) {
    if (edad <= 17) return 'ESTUDIANTE';
    if (edad <= 25) return randomChoice(['ESTUDIANTE','EMPLEADO','FREELANCE','DEPORTISTA','ARTISTA','DESEMPLEADO','OTRO']);
    if (edad <= 40) return randomChoice(OCUPACIONES.filter(o => o !== 'JUBILADO'));
    if (edad <= 55) return randomChoice(OCUPACIONES.filter(o => o !== 'ESTUDIANTE'));
    return randomChoice(OCUPACIONES);
}

// ─── WEIGHT/HEIGHT CORRELATIONS ───
function getCorrelatedWeight(edad, genero) {
    const base = genero === 'FEMENINO' ? { min: -5, max: -10 } : { min: 0, max: 0 };
    if (edad <= 17) return randomFloat(40 + base.min, 75 + base.max);
    if (edad <= 25) return randomFloat(50 + base.min, 95 + base.max);
    if (edad <= 40) return randomFloat(55 + base.min, 110 + base.max);
    if (edad <= 55) return randomFloat(55 + base.min, 120 + base.max);
    return randomFloat(50 + base.min, 110 + base.max);
}

function getCorrelatedHeight(edad, genero) {
    const base = genero === 'FEMENINO' ? -10 : 0;
    if (edad <= 17) return randomInt(145 + base, 180 + base);
    return randomInt(155 + base, 195 + base);
}

// ─── DISABILITY DISTRIBUTION ───
function getRandomDisability() {
    return Math.random() < 0.75 ? 'NINGUNA' : randomChoice(DISCAPACIDADES.filter(d => d !== 'NINGUNA'));
}

// ─── GENDER DISTRIBUTION ───
function getRandomGender() {
    const r = Math.random();
    if (r < 0.48) return 'MASCULINO';
    if (r < 0.96) return 'FEMENINO';
    return 'OTRO';
}

// ─── MAIN GENERATOR ───
/**
 * Generates a single user data object based on the test configuration.
 * Fields set in config are used as-is; null/undefined fields are randomly generated.
 * Age is automatically constrained by occupation when not explicitly set.
 * @param {Object} config - Test configuration with optional fixed fields
 * @param {string} prefix - 'sql' or 'nosql' for email domain
 * @param {number} timestamp - Batch timestamp for unique emails
 * @param {number} index - Sequential index for unique emails
 * @returns {{ userData: Object, metricData: Object }}
 */
export function generateUser(config, prefix, timestamp, index) {
    // Resolve age range (considers occupation constraints + explicit overrides)
    const ageRange = resolveAgeRange(config);
    const edad = randomInt(ageRange.min, ageRange.max);
    const genero = config.genero || getRandomGender();

    // Name based on gender
    let nombre;
    if (genero === 'FEMENINO') {
        nombre = randomChoice(NOMBRES_F) + ' ' + randomChoice(APELLIDOS);
    } else {
        nombre = randomChoice(NOMBRES_M) + ' ' + randomChoice(APELLIDOS);
    }

    // Occupation: config.ocupacion (single), config.ocupaciones (array to pick from), or random
    let ocupacion;
    if (config.ocupacion) {
        ocupacion = config.ocupacion;
    } else if (config.ocupaciones && config.ocupaciones.length > 0) {
        ocupacion = randomChoice(config.ocupaciones);
    } else {
        ocupacion = getValidOccupation(edad);
    }

    // Safety: if age <= 17, occupation MUST be ESTUDIANTE
    if (edad <= 17 && ocupacion !== 'ESTUDIANTE') {
        ocupacion = 'ESTUDIANTE';
    }
    // Safety: JUBILADO only for 56+
    if (edad < 56 && ocupacion === 'JUBILADO') {
        ocupacion = getValidOccupation(edad);
    }

    const peso = config.peso || getCorrelatedWeight(edad, genero);
    const estatura = config.estatura || getCorrelatedHeight(edad, genero);
    const pais = config.pais || (config.paises ? randomChoice(config.paises) : randomChoice(PAISES));
    const nivel_actividad = config.nivel_actividad || randomChoice(NIVELES_ACTIVIDAD);
    const discapacidad = config.discapacidad || getRandomDisability();

    const email = `${prefix}_${timestamp}_${index}@quantify-pop.test`;
    // Username: stripped first name + unique suffix (alphanumeric only, guaranteed unique)
    const firstNameClean = stripAccents(nombre.split(' ')[0]);
    const username = `${firstNameClean}${timestamp % 100000}${index}`;

    return {
        userData: {
            nombre,
            username,
            email,
            pais,
            rol: 1
        },
        metricData: {
            edad,
            peso: typeof peso === 'number' ? peso : parseFloat(peso),
            estatura: typeof estatura === 'number' ? estatura : parseInt(estatura),
            genero,
            nivel_actividad,
            discapacidad,
            ocupacion
        }
    };
}

/**
 * Generates an array of N users based on test configuration.
 */
export function generateBatch(config, prefix, timestamp, startIndex, count) {
    const users = [];
    for (let i = 0; i < count; i++) {
        users.push(generateUser(config, prefix, timestamp, startIndex + i));
    }
    return users;
}
