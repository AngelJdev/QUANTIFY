package com.example.smarttv_quantify.data.repository

import com.example.smarttv_quantify.data.remote.ApiClient
import com.example.smarttv_quantify.data.remote.ApiService
import com.example.smarttv_quantify.data.remote.TokenHolder
import com.example.smarttv_quantify.data.remote.dto.AchievementsData
import com.example.smarttv_quantify.data.remote.dto.AdherenceData
import com.example.smarttv_quantify.data.remote.dto.ApiEnvelope
import com.example.smarttv_quantify.data.remote.dto.DeviceRequest
import com.example.smarttv_quantify.data.remote.dto.DisconnectData
import com.example.smarttv_quantify.data.remote.dto.GlobalStatsData
import com.example.smarttv_quantify.data.remote.dto.HabitDto
import com.example.smarttv_quantify.data.remote.dto.HealthResponse
import com.example.smarttv_quantify.data.remote.dto.PairRequestData
import com.example.smarttv_quantify.data.remote.dto.PairStatusData
import com.example.smarttv_quantify.data.remote.dto.ProfileData

import com.example.smarttv_quantify.data.remote.dto.CheckStatusRequest

// Acceso central a la API Quantify
class QuantifyRepository(private val baseUrl: String) {

    private val api: ApiService = ApiClient.service(baseUrl)

    suspend fun health(): HealthResponse = api.health()

    suspend fun requestPair(): ApiEnvelope<PairRequestData> =
        api.requestPair(DeviceRequest("Smart TV"))

    suspend fun getPairStatus(code: String): ApiEnvelope<PairStatusData> =
        api.pairStatus(CheckStatusRequest(code))

    suspend fun disconnect(): ApiEnvelope<DisconnectData> =
        api.disconnect()

    suspend fun getProfile(): ApiEnvelope<ProfileData> =
        api.getProfile()

    suspend fun getGlobalStats(): ApiEnvelope<GlobalStatsData> =
        api.getGlobalStats()

    suspend fun getHabits(): ApiEnvelope<List<HabitDto>> =
        api.getHabits()

    suspend fun getAdherence(habitId: Long): ApiEnvelope<AdherenceData> =
        api.getAdherence(habitId)

    suspend fun getAchievements(): ApiEnvelope<AchievementsData> =
        api.getAchievements()
}
