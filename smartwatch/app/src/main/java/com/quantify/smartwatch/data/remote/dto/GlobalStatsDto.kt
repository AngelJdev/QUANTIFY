package com.quantify.smartwatch.data.remote.dto

/**
 * Response from GET /api/logs/global-stats
 * Maps to: log.controller.js → getGlobalStats()
 *
 * Used for Watchface (2.1) progress ring and weekly summary (4.1).
 */
data class GlobalStatsDto(
    val globalScore: Int = 0,
    val dailyCompletion: Int = 0,
    val totalHabits: Int = 0,
    val dailyPerformance: List<DailyPerformanceDto> = emptyList()
)

data class DailyPerformanceDto(
    val fecha: String,
    val completados: Int = 0,
    val total: Int = 0,
    val porcentaje: Int = 0
)

/**
 * Response from GET /api/logs/adherence/:habitId
 * Maps to: log.controller.js → getAdherenceStats()
 */
data class AdherenceStatsDto(
    val adherenceScore: Int = 0,
    val diasCumplidos: Int = 0,
    val diasProgramados: Int = 0,
    val tendenciaSemanal: Int = 0,
    val chartData: List<ChartDataDto> = emptyList(),
    val isNewHabit: Boolean = false
)

data class ChartDataDto(
    val fecha: String,
    val valor: Double = 0.0,
    val esfuerzo: Int = 0
)
