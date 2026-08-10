package com.quantify.smartwatch.data.remote.dto

/**
 * Request body for POST /api/logs
 * Maps to: log.controller.js → createLog()
 *
 * The backend accepts these fields and creates a MongoDB Log document.
 * fecha_registro uses the ORIGINAL timestamp from the watch (offline-first).
 */
data class LogRequest(
    val habito_id: Int,
    val fecha_registro: String,     // ISO 8601 date string
    val completado: Boolean = true,
    val valor_registrado: Double? = null,
    val notas: String? = null
)
