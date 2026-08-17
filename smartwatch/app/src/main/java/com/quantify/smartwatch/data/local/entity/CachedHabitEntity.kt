package com.quantify.smartwatch.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Local cache of habits fetched from the QUANTIFY backend.
 * Maps to the SQL Habit model: backend/SQL/models/habit.model.js
 *
 * Fields mirror the backend exactly:
 * - tipo_medicion: "BOOLEANO" | "NUMERICO" | "TIEMPO"
 * - meta_diaria: DECIMAL(10,2) from backend
 * - unidad: e.g. "litros", "páginas", "minutos"
 * - frecuencia: "DIARIO" | "SEMANAL" | "PERSONALIZADO"
 */
@Entity(tableName = "cached_habits")
data class CachedHabitEntity(
    @PrimaryKey val id: Int,
    val usuario_id: Int,
    val nombre: String,
    val descripcion: String? = null,
    val tipo_medicion: String = "BOOLEANO",
    val meta_diaria: Double? = null,
    val unidad: String? = null,
    val frecuencia: String = "DIARIO",
    val activo: Boolean = true,
    val completado_hoy: Boolean = false,
    val valor_hoy: Double? = null
)
