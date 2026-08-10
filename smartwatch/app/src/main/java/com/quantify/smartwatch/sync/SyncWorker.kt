package com.quantify.smartwatch.sync

import android.content.Context
import androidx.work.*
import com.quantify.smartwatch.data.local.QuantifyDatabase
import com.quantify.smartwatch.data.preferences.UserPreferences
import com.quantify.smartwatch.data.repository.HabitRepository
import com.quantify.smartwatch.data.repository.SyncRepository
import java.util.concurrent.TimeUnit

/**
 * WorkManager Worker — Background Sync Engine.
 *
 * Triggered automatically by Android when WiFi is available.
 * Processes the offline action queue and telemetry buffer,
 * then refreshes the local habit cache.
 *
 * Schedule:
 * - Periodic: Every 15/30/60 minutes (configurable in Settings 5.1)
 * - One-shot: When user presses "Sincronizar ahora" (Screen 2.2)
 * - Constraint: Requires CONNECTED network
 */
class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val db = QuantifyDatabase.getInstance(applicationContext)
        val prefs = UserPreferences(applicationContext)
        val syncRepo = SyncRepository(
            actionQueueDao = db.actionQueueDao(),
            telemetryDao = db.telemetryDao(),
            prefs = prefs
        )
        val habitRepo = HabitRepository(db.habitDao())

        return try {
            // 1. Sync pending actions and telemetry to backend
            val syncSuccess = syncRepo.performSync()

            if (syncSuccess) {
                // 2. Refresh habit cache from backend
                habitRepo.refreshFromRemote()

                // 3. Refresh user profile (streaks)
                syncRepo.refreshUserProfile()

                Result.success()
            } else {
                // Retry with backoff
                if (runAttemptCount < 3) {
                    Result.retry()
                } else {
                    Result.failure()
                }
            }
        } catch (e: Exception) {
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }

    companion object {
        const val WORK_NAME_PERIODIC = "quantify_periodic_sync"
        const val WORK_NAME_ONESHOT = "quantify_oneshot_sync"

        /**
         * Schedule periodic background sync.
         * Uses WiFi constraint — only runs when network is available.
         */
        fun schedulePeriodic(context: Context, intervalMinutes: Long = 15) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = PeriodicWorkRequestBuilder<SyncWorker>(
                intervalMinutes, TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .setBackoffCriteria(
                    BackoffPolicy.EXPONENTIAL,
                    1, TimeUnit.MINUTES
                )
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME_PERIODIC,
                ExistingPeriodicWorkPolicy.UPDATE,
                request
            )
        }

        /**
         * Trigger immediate one-shot sync (Screen 2.2 "Sincronizar ahora").
         */
        fun syncNow(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val request = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueueUniqueWork(
                WORK_NAME_ONESHOT,
                ExistingWorkPolicy.REPLACE,
                request
            )
        }

        /**
         * Cancel all sync work (used on unlink).
         */
        fun cancelAll(context: Context) {
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME_PERIODIC)
            WorkManager.getInstance(context).cancelUniqueWork(WORK_NAME_ONESHOT)
        }
    }
}
