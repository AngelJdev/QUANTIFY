package com.quantify.smartwatch.data.remote.dto

/**
 * DTOs for the smartwatch pairing flow (Commit 5 endpoints).
 * POST /api/smartwatch/generate-code
 * GET  /api/smartwatch/poll-auth
 * POST /api/smartwatch/sync
 */

/** Response from POST /api/smartwatch/generate-code */
data class PairingCodeDto(
    val code: String,
    val deviceId: String,
    val expiresAt: String
)

/** Response from GET /api/smartwatch/poll-auth?deviceId=X */
data class PollAuthDto(
    val authorized: Boolean = false,
    val token: String? = null,
    val user: UserDto? = null
)

/** Response from GET /api/smartwatch/dashboard */
data class WatchDashboardDto(
    val user: UserDto,
    val habits: List<HabitDto> = emptyList(),
    val stats: DashboardStatsDto
)

data class DashboardStatsDto(
    val totalHabits: Int = 0,
    val completedToday: Int = 0,
    val completionPercent: Int = 0
)

/** Request body for POST /api/smartwatch/sync (batch of offline actions) */
data class SyncRequest(
    val actions: List<SyncAction>,
    val telemetry: List<SyncTelemetry> = emptyList()
)

data class SyncAction(
    val actionId: String,
    val type: String,
    val habitId: Int,
    val completado: Boolean,
    val valorRegistrado: Double? = null,
    val timestamp: String       // ISO 8601 original timestamp
)

data class SyncTelemetry(
    val avgBpm: Int?,
    val maxBpm: Int?,
    val minBpm: Int?,
    val avgStress: Int?,
    val sampleCount: Int,
    val startTime: String,
    val endTime: String
)

/** Response from POST /api/smartwatch/sync */
data class SyncResponse(
    val processedActions: Int = 0,
    val processedTelemetry: Int = 0,
    val errors: List<String> = emptyList()
)
