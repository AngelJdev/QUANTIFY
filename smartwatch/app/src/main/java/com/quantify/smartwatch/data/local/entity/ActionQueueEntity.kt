package com.quantify.smartwatch.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

/**
 * Immutable event in the offline-first Action Queue.
 * Every user action is stored here FIRST, then synced to the backend.
 *
 * Maps to POST /api/logs body:
 * - habito_id  → habitId
 * - completado → completado
 * - valor_registrado → valorRegistrado
 * - fecha_registro → timestamp (converted to ISO Date)
 *
 * syncStatus: "PENDING" | "SYNCED" | "ERROR"
 */
@Entity(tableName = "action_queue")
data class ActionQueueEntity(
    @PrimaryKey val actionId: String = UUID.randomUUID().toString(),
    val type: String,           // "HABIT_COMPLETE" | "HABIT_LOG_VALUE" | "HABIT_UNDO"
    val habitId: Int,
    val completado: Boolean = true,
    val valorRegistrado: Double? = null,
    val timestamp: Long = System.currentTimeMillis(),
    val syncStatus: String = "PENDING",
    val retryCount: Int = 0
)
