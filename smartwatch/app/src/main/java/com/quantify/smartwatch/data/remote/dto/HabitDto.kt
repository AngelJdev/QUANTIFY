package com.quantify.smartwatch.data.remote.dto

/**
 * Habit DTO — maps to GET /api/habits response items.
 * Fields match backend/SQL/models/habit.model.js exactly.
 *
 * tipo_medicion: "BOOLEANO" | "NUMERICO" | "TIEMPO"
 * frecuencia:    "DIARIO" | "SEMANAL" | "PERSONALIZADO"
 */
data class HabitDto(
    val id: Int,
    val usuario_id: Int,
    val nombre: String,
    val descripcion: String? = null,
    val tipo_medicion: String = "BOOLEANO",
    val meta_diaria: Double? = null,
    val unidad: String? = null,
    val frecuencia: String = "DIARIO",
    val fecha_fin: String? = null,
    val duracion_tipo: String? = null,
    val activo: Boolean = true,
    val fecha_creacion: String? = null
)
