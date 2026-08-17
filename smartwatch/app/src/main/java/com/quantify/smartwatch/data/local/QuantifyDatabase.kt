package com.quantify.smartwatch.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.quantify.smartwatch.data.local.dao.ActionQueueDao
import com.quantify.smartwatch.data.local.dao.HabitDao
import com.quantify.smartwatch.data.local.dao.TelemetryDao
import com.quantify.smartwatch.data.local.entity.ActionQueueEntity
import com.quantify.smartwatch.data.local.entity.CachedHabitEntity
import com.quantify.smartwatch.data.local.entity.TelemetryEntity

/**
 * QUANTIFY Smartwatch — Room Database
 * Offline-first local storage for:
 * - cached_habits:     Mirror of user's habits from the backend
 * - action_queue:      Pending actions to sync (habit completions, values)
 * - telemetry_buffer:  Compacted sensor data (BPM, stress)
 */
@Database(
    entities = [
        CachedHabitEntity::class,
        ActionQueueEntity::class,
        TelemetryEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class QuantifyDatabase : RoomDatabase() {

    abstract fun habitDao(): HabitDao
    abstract fun actionQueueDao(): ActionQueueDao
    abstract fun telemetryDao(): TelemetryDao

    companion object {
        @Volatile
        private var INSTANCE: QuantifyDatabase? = null

        fun getInstance(context: Context): QuantifyDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    QuantifyDatabase::class.java,
                    "quantify_watch.db"
                )
                    .fallbackToDestructiveMigration()
                    .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
