package com.quantify.smartwatch.data.remote

import com.quantify.smartwatch.data.remote.dto.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Retrofit interface for the QUANTIFY Backend API.
 * All endpoints match the routes defined in backend/server.js:
 *
 * Existing:   /api/auth, /api/habits, /api/logs
 * New (C5):   /api/smartwatch
 *
 * Auth header is injected automatically by RetrofitClient interceptor.
 */
interface ApiService {

    // ═══════════════════════════════════════════
    // AUTH (backend/API/routes/auth.routes.js)
    // ═══════════════════════════════════════════

    @POST("auth/login")
    suspend fun login(@Body body: Map<String, String>): Response<ApiResponse<LoginResponse>>

    @GET("auth/profile")
    suspend fun getProfile(): Response<ApiResponse<LoginResponse>>

    // ═══════════════════════════════════════════
    // HABITS (backend/API/routes/habit.routes.js)
    // ═══════════════════════════════════════════

    @GET("habits")
    suspend fun getHabits(): Response<ApiResponse<List<HabitDto>>>

    @GET("habits/{id}")
    suspend fun getHabitById(@Path("id") id: Int): Response<ApiResponse<HabitDto>>

    // ═══════════════════════════════════════════
    // LOGS (backend/API/routes/log.routes.js)
    // ═══════════════════════════════════════════

    @POST("logs")
    suspend fun createLog(@Body body: LogRequest): Response<ApiResponse<Any>>

    @GET("logs/global-stats")
    suspend fun getGlobalStats(): Response<ApiResponse<GlobalStatsDto>>

    @GET("logs/adherence/{habitId}")
    suspend fun getAdherenceStats(@Path("habitId") habitId: Int): Response<ApiResponse<AdherenceStatsDto>>

    // ═══════════════════════════════════════════
    // HEALTH CHECK (backend/server.js L94)
    // ═══════════════════════════════════════════

    @GET("health")
    suspend fun healthCheck(): Response<ApiResponse<Any>>

    // ═══════════════════════════════════════════
    // SMARTWATCH (Commit 5 endpoints)
    // ═══════════════════════════════════════════

    @POST("smartwatch/generate-code")
    suspend fun generatePairingCode(@Body body: Map<String, String>): Response<ApiResponse<PairingCodeDto>>

    @GET("smartwatch/poll-auth")
    suspend fun pollAuth(@Query("deviceId") deviceId: String): Response<ApiResponse<PollAuthDto>>

    @POST("smartwatch/sync")
    suspend fun syncData(@Body body: SyncRequest): Response<ApiResponse<SyncResponse>>
}
