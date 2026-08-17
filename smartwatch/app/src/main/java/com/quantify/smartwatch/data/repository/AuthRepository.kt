package com.quantify.smartwatch.data.repository

import com.quantify.smartwatch.data.preferences.UserPreferences
import com.quantify.smartwatch.data.remote.RetrofitClient
import com.quantify.smartwatch.data.remote.dto.PollAuthDto
import java.util.UUID

/**
 * Repository for authentication and device pairing.
 * Manages the code-based auth flow:
 * 1. Generate pairing code (POST /api/smartwatch/generate-code)
 * 2. Poll for authorization (GET /api/smartwatch/poll-auth)
 * 3. Store JWT on success
 */
class AuthRepository(private val prefs: UserPreferences) {

    private val api = RetrofitClient.apiService

    /**
     * Generate a unique device ID for this watch instance.
     */
    fun generateDeviceId(): String = "QWATCH-${UUID.randomUUID().toString().take(8).uppercase()}"

    /**
     * Request a pairing code from the backend.
     * Returns the 6-char code to display on screen.
     */
    suspend fun generatePairingCode(deviceId: String): Result<String> {
        return try {
            val response = api.generatePairingCode(mapOf("deviceId" to deviceId))
            if (response.isSuccessful && response.body()?.success == true) {
                val code = response.body()!!.data!!.code
                prefs.saveDeviceId(deviceId)
                Result.success(code)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Error generating code"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Poll the backend to check if the user has authorized this device
     * from the web app. Returns token and user data on success.
     */
    suspend fun pollAuth(deviceId: String): Result<PollAuthDto> {
        return try {
            val response = api.pollAuth(deviceId)
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()!!.data!!
                if (data.authorized && data.token != null && data.user != null) {
                    // Save session
                    RetrofitClient.setToken(data.token)
                    prefs.saveSession(
                        token = data.token,
                        userId = data.user.id,
                        email = data.user.email,
                        name = data.user.nombre
                    )
                    prefs.updateStreaks(data.user.current_streak, data.user.max_streak)
                }
                Result.success(data)
            } else {
                Result.success(PollAuthDto(authorized = false))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Check if backend is reachable.
     */
    suspend fun checkHealth(): Boolean {
        return try {
            val response = api.healthCheck()
            response.isSuccessful
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Clear all session data (unlink device).
     */
    suspend fun unlink() {
        RetrofitClient.setToken(null)
        prefs.clearAll()
    }
}
