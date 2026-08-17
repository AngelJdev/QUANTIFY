package com.quantify.smartwatch.data.local.dao

import androidx.room.*
import com.quantify.smartwatch.data.local.entity.ActionQueueEntity

/**
 * DAO for the offline-first Action Queue.
 * Actions are inserted as PENDING → processed by SyncWorker → marked SYNCED.
 */
@Dao
interface ActionQueueDao {

    @Query("SELECT * FROM action_queue WHERE syncStatus = 'PENDING' ORDER BY timestamp ASC")
    suspend fun getPendingActions(): List<ActionQueueEntity>

    @Query("SELECT COUNT(*) FROM action_queue WHERE syncStatus = 'PENDING'")
    suspend fun getPendingCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(action: ActionQueueEntity)

    @Query("UPDATE action_queue SET syncStatus = 'SYNCED' WHERE actionId = :actionId")
    suspend fun markSynced(actionId: String)

    @Query("UPDATE action_queue SET syncStatus = 'ERROR', retryCount = retryCount + 1 WHERE actionId = :actionId")
    suspend fun markError(actionId: String)

    @Query("DELETE FROM action_queue WHERE syncStatus = 'SYNCED'")
    suspend fun clearSynced()

    @Query("DELETE FROM action_queue")
    suspend fun clearAll()
}
