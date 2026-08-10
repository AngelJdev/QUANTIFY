package com.quantify.smartwatch.data.repository

import com.quantify.smartwatch.data.local.dao.ActionQueueDao
import com.quantify.smartwatch.data.local.dao.TelemetryDao
import com.quantify.smartwatch.data.preferences.UserPreferences
import com.quantify.smartwatch.data.remote.RetrofitClient
import com.quantify.smartwatch.data.remote.dto.*
import java.text.SimpleDateFormat
import java.util.*

/**
 * Sync Engine Repository — processes the offline action queue
 * and telemetry buffer, sending batches to the backend.
 *
 * Called by SyncWorker (WorkManager) when WiFi is available.
 *
 * Flow:
 * 1. Read PENDING actions from action_queue
 * 2. Read PENDING telemetry from telemetry_buffer
 * 3. POST /api/smartwatch/sync with the batch
 * 4. Mark items as SYNCED on success
 * 5. Refresh habit cache from backend
 * 6. Update last sync timestamp
 */
class SyncRepository(
    private val actionQueueDao: ActionQueueDao,
    private val telemetryDao: TelemetryDao,
    private val prefs: UserPreferences
) {
    private val api = RetrofitClient.apiService
    private val isoFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
        timeZone = TimeZone.getTimeZone("UTC")
    }

    /**
     * Execute a full sync cycle. Returns true if successful.
     */
    suspend fun performSync(): Boolean {
        return try {
            // 1. Gather pending actions
            val pendingActions = actionQueueDao.getPendingActions()
            val pendingTelemetry = telemetryDao.getPendingTelemetry()

            if (pendingActions.isEmpty() && pendingTelemetry.isEmpty()) {
                // Nothing to sync, but still refresh cache
                prefs.updateLastSync()
                return true
            }

            // 2. Convert to sync DTOs with original timestamps
            val syncActions = pendingActions.map { action ->
                SyncAction(
                    actionId = action.actionId,
                    type = action.type,
                    habitId = action.habitId,
                    completado = action.completado,
                    valorRegistrado = action.valorRegistrado,
                    timestamp = isoFormat.format(Date(action.timestamp))
                )
            }

            val syncTelemetry = pendingTelemetry.map { t ->
                SyncTelemetry(
                    avgBpm = t.avgBpm,
                    maxBpm = t.maxBpm,
                    minBpm = t.minBpm,
                    avgStress = t.avgStress,
                    sampleCount = t.sampleCount,
                    startTime = isoFormat.format(Date(t.startTime)),
                    endTime = isoFormat.format(Date(t.endTime))
                )
            }

            // 3. Send batch to backend
            val request = SyncRequest(actions = syncActions, telemetry = syncTelemetry)
            val response = api.syncData(request)

            if (response.isSuccessful && response.body()?.success == true) {
                // 4. Mark everything as synced
                pendingActions.forEach { actionQueueDao.markSynced(it.actionId) }
                pendingTelemetry.forEach { telemetryDao.markSynced(it.id) }

                // 5. Clean up synced items
                actionQueueDao.clearSynced()
                telemetryDao.clearSynced()

                // 6. Update last sync timestamp
                prefs.updateLastSync()

                true
            } else {
                // Mark individual failures
                pendingActions.forEach { actionQueueDao.markError(it.actionId) }
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    /**
     * Fetch updated user profile (streaks) from backend.
     */
    suspend fun refreshUserProfile(): Boolean {
        return try {
            val response = api.getProfile()
            if (response.isSuccessful && response.body()?.success == true) {
                val user = response.body()!!.data?.user ?: return false
                prefs.updateStreaks(user.current_streak, user.max_streak)
                true
            } else false
        } catch (e: Exception) {
            false
        }
    }
}
