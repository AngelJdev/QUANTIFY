package com.quantify.smartwatch.data.local.dao

import androidx.room.*
import com.quantify.smartwatch.data.local.entity.TelemetryEntity

/**
 * DAO for telemetry sensor buffer.
 * Data is buffered locally every 5 minutes, batch-synced when WiFi is available.
 */
@Dao
interface TelemetryDao {

    @Query("SELECT * FROM telemetry_buffer WHERE syncStatus = 'PENDING' ORDER BY startTime ASC")
    suspend fun getPendingTelemetry(): List<TelemetryEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(telemetry: TelemetryEntity)

    @Query("UPDATE telemetry_buffer SET syncStatus = 'SYNCED' WHERE id = :id")
    suspend fun markSynced(id: String)

    @Query("DELETE FROM telemetry_buffer WHERE syncStatus = 'SYNCED'")
    suspend fun clearSynced()

    @Query("DELETE FROM telemetry_buffer")
    suspend fun clearAll()
}
