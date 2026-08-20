package com.example.smarttv_quantify.data.remote.dto

import com.squareup.moshi.FromJson
import com.squareup.moshi.Json
import com.squareup.moshi.JsonQualifier
import com.squareup.moshi.JsonReader
import com.squareup.moshi.JsonWriter
import com.squareup.moshi.ToJson

// Envoltorio estándar de la API Quantify: { success, message, data }
data class ApiEnvelope<T>(
    val success: Boolean = false,
    val message: String? = null,
    val data: T? = null
)

data class HealthResponse(
    val status: String = "",
    val message: String? = null
)

// ===== Pairing (Smart TV) =====

data class DeviceRequest(
    val device_name: String = "Smart TV"
)

data class PairRequestData(
    val code: String? = null,
    @param:Json(name = "expires_in") val expiresIn: Int = 300
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

data class ProfileData(
    val user: UserSummary? = null
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
    @param:FlexibleDouble val meta_diaria: Double? = null,
    val unidad: String? = null,
    val frecuencia: String? = null,
    val activo: Boolean = true,
    val completado_hoy: Boolean = false
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
    val catalog: List<CatalogAchievementDto> = emptyList(),
    val unlockedCount: Int = 0,
    val totalCatalogCount: Int = 0
)

data class AchievementDto(
    val id: Int? = null,
    val titulo: String? = null,
    val descripcion: String? = null,
    val mes_logro: String? = null,
    val icono_url: String? = null
)

data class CatalogAchievementDto(
    val id: String = "",
    val titulo: String = "",
    val descripcion: String = "",
    val requisito: String = "",
    val categoria: String = "",
    val rareza: String = "",
    val icono_key: String? = null,
    val icono: String? = null,
    val unlocked: Boolean = false,
    val fecha_obtencion: String? = null,
    val mes_logro: String? = null
)

@Retention(AnnotationRetention.RUNTIME)
@JsonQualifier
annotation class FlexibleDouble

/** Acepta DECIMAL de Sequelize tanto como número JSON como cadena. */
class FlexibleDoubleJsonAdapter {
    @FromJson
    @FlexibleDouble
    fun fromJson(reader: JsonReader): Double? = when (reader.peek()) {
        JsonReader.Token.NULL -> reader.nextNull<Unit>().let { null }
        JsonReader.Token.NUMBER -> reader.nextDouble()
        JsonReader.Token.STRING -> reader.nextString().toDoubleOrNull()
        else -> {
            reader.skipValue()
            null
        }
    }

    @ToJson
    fun toJson(writer: JsonWriter, @FlexibleDouble value: Double?) {
        if (value == null) writer.nullValue() else writer.value(value)
    }
}
