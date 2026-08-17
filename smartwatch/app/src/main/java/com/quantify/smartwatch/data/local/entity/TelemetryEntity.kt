package com.quantify.smartwatch.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.UUID

/**
 * Compacted telemetry data from wearable sensors.
 * Buffered locally every 5 minutes, batch-synced when WiFi is available.
 * Stored in MongoDB via POST /api/smartwatch/sync → watchTelemetry collection.
 */
@Entity(tableName = "telemetry_buffer")
data class TelemetryEntity(
    @PrimaryKey val id: String = UUID.randomUUID().toString(),
    val avgBpm: Int? = null,
    val maxBpm: Int? = null,
    val minBpm: Int? = null,
    val avgStress: Int? = null,
    val sampleCount: Int = 0,
    val startTime: Long,
    val endTime: Long,
    val syncStatus: String = "PENDING"
)
