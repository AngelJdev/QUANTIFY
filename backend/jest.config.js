/**
 * ==============================================================================
 * QUANTIFY — Configuracion de Jest para pruebas del Backend
 * ==============================================================================
 *
 * Define las opciones de Jest para ejecutar las suites de pruebas
 * de la API REST y las pruebas de integracion.
 *
 * Autor: Equipo QUANTIFY
 * Fecha: Agosto 2026
 */

export default {
    // Entorno de ejecucion
    testEnvironment: 'node',

    // Transformacion de modulos ESM
    transform: {},

    // Patron de busqueda de archivos de prueba
    testMatch: [
        '<rootDir>/tests/**/*.test.js',
    ],

    // Timeout por defecto para cada test (10 segundos)
    testTimeout: 10000,

    // Mostrar resultados detallados
    verbose: true,

    // Forzar salida despues de completar las pruebas
    forceExit: true,

    // Detectar handles abiertos
    detectOpenHandles: true,
};
