package com.quantify.smartwatch.data.repository

import com.quantify.smartwatch.data.local.dao.ActionQueueDao
import com.quantify.smartwatch.data.local.entity.ActionQueueEntity
import java.util.UUID

/**
 * Repository for habit log actions.
 * Implements the "write to local queue first" principle.
 *
 * Every action goes: User → ActionQueue (Room) → SyncWorker → POST /api/logs
 * This ensures data is NEVER lost, even without WiFi.
 */
class LogRepository(private val actionQueueDao: ActionQueueDao) {

    /**
     * Enqueue a boolean habit completion.
     * Maps to: POST /api/logs { habito_id, completado: true, fecha_registro }
     */
    suspend fun enqueueHabitComplete(habitId: Int) {
        val action = ActionQueueEntity(
            actionId = UUID.randomUUID().toString(),
            type = "HABIT_COMPLETE",
            habitId = habitId,
            completado = true,
            valorRegistrado = null,
            timestamp = System.currentTimeMillis()
        )
        actionQueueDao.insert(action)
    }

    /**
     * Enqueue a numeric/time habit value registration.
     * Maps to: POST /api/logs { habito_id, completado: true, valor_registrado, fecha_registro }
     */
    suspend fun enqueueHabitLogValue(habitId: Int, value: Double) {
        val action = ActionQueueEntity(
            actionId = UUID.randomUUID().toString(),
            type = "HABIT_LOG_VALUE",
            habitId = habitId,
            completado = true,
            valorRegistrado = value,
            timestamp = System.currentTimeMillis()
        )
        actionQueueDao.insert(action)
    }

    /**
     * Get count of pending actions (for UI badge).
     */
    suspend fun getPendingCount(): Int = actionQueueDao.getPendingCount()

    /**
     * Get all pending actions (for SyncWorker).
     */
    suspend fun getPendingActions(): List<ActionQueueEntity> = actionQueueDao.getPendingActions()

    suspend fun markSynced(actionId: String) = actionQueueDao.markSynced(actionId)

    suspend fun markError(actionId: String) = actionQueueDao.markError(actionId)

    suspend fun clearSynced() = actionQueueDao.clearSynced()

    suspend fun clearAll() = actionQueueDao.clearAll()
}
