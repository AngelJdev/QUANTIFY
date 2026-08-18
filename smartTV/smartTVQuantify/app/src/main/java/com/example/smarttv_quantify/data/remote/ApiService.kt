package com.example.smarttv_quantify.data.remote

import com.example.smarttv_quantify.data.remote.dto.ApiEnvelope
import com.example.smarttv_quantify.data.remote.dto.DeviceRequest
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import com.example.smarttv_quantify.data.remote.dto.AchievementsData
import com.example.smarttv_quantify.data.remote.dto.AdherenceData
import com.example.smarttv_quantify.data.remote.dto.DisconnectData
import com.example.smarttv_quantify.data.remote.dto.GlobalStatsData
import com.example.smarttv_quantify.data.remote.dto.HabitDto
import com.example.smarttv_quantify.data.remote.dto.PairRequestData
import com.example.smarttv_quantify.data.remote.dto.PairStatusData
import com.example.smarttv_quantify.data.remote.dto.UserSummary

import com.example.smarttv_quantify.data.remote.dto.CheckStatusRequest

// Endpoints de la API Quantify (backend/server.js)
interface ApiService {

    // ===== Pairing Smart TV =====
    @POST("smarttv/request-code")
    suspend fun requestPair(@Body body: DeviceRequest): ApiEnvelope<PairRequestData>

    @POST("smarttv/check-status")
    suspend fun pairStatus(@Body body: CheckStatusRequest): ApiEnvelope<PairStatusData>

    @POST("smarttv/unlink")
    suspend fun disconnect(): ApiEnvelope<DisconnectData>

    // ===== Datos del usuario (requieren token) =====
    @GET("auth/profile")
    suspend fun getProfile(): ApiEnvelope<UserSummary>

    @GET("logs/global-stats")
    suspend fun getGlobalStats(): ApiEnvelope<GlobalStatsData>

    @GET("habits")
    suspend fun getHabits(): ApiEnvelope<List<HabitDto>>

    @GET("logs/adherence/{habitId}")
    suspend fun getAdherence(@Path("habitId") habitId: Long): ApiEnvelope<AdherenceData>

    @GET("achievements")
    suspend fun getAchievements(): ApiEnvelope<AchievementsData>
}
