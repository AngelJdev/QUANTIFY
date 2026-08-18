package com.example.smarttv_quantify.data.remote.dto

// Envoltorio estándar de la API Quantify: { success, message, data }
data class ApiEnvelope<T>(
    val success: Boolean = false,
    val message: String? = null,
    val data: T? = null
)

// ===== Pairing (Smart TV) =====

data class DeviceRequest(
    val device_name: String = "Smart TV"
)

data class PairRequestData(
    val code: String? = null,
    val expiresAt: String? = null,
    val ttlSeconds: Int? = null
)

data class CheckStatusRequest(
    val code: String
)

data class UserSummary(
    val id: Int? = null,
    val nombre: String? = null,
    val email: String? = null,
    val current_streak: Int? = 0
)

data class PairStatusData(
    val status: String? = null,
    val user: UserSummary? = null,
    val token: String? = null
)

data class DisconnectData(
    val disconnected: Boolean = false
)

// ===== Dashboard =====

data class GlobalStatsData(
    val globalScore: Int = 0,
    val dailyCompletion: Int = 0,
    val totalHabits: Int = 0,
    val dailyPerformance: List<DailyPoint> = emptyList()
)

data class DailyPoint(
    val fecha: String? = null,
    val completados: Int = 0,
    val total: Int = 0,
    val porcentaje: Int = 0
)

// ===== Hábitos =====

data class HabitDto(
    val id: Long = 0,
    val nombre: String = "",
    val descripcion: String? = null,
    val tipo_medicion: String? = null,
    val meta_diaria: Double? = null,
    val unidad: String? = null,
    val frecuencia: String? = null,
    val activo: Boolean = true
)

data class AdherenceData(
    val adherenceScore: Int = 0,
    val diasCumplidos: Int = 0,
    val diasProgramados: Int = 0,
    val tendenciaSemanal: Int = 0,
    val chartData: List<ChartPoint> = emptyList(),
    val isNewHabit: Boolean = false
)

data class ChartPoint(
    val fecha: String? = null,
    val valor: Double = 0.0,
    val esfuerzo: Int = 0
)

// ===== Logros =====

data class AchievementsData(
    val achievements: List<AchievementDto> = emptyList(),
    val total: Int = 0
)

data class AchievementDto(
    val id: Int? = null,
    val titulo: String? = null,
    val descripcion: String? = null,
    val mes_logro: String? = null,
    val icono_url: String? = null
)
