package com.quantify.smartwatch

import android.app.Application
import androidx.work.Configuration
import androidx.work.WorkManager

/**
 * QUANTIFY Smartwatch — Application class
 * Initializes WorkManager for background sync and global app state.
 */
class QuantifyApp : Application(), Configuration.Provider {

    override fun onCreate() {
        super.onCreate()
        // WorkManager is auto-initialized via getWorkManagerConfiguration()
    }

    /**
     * Custom WorkManager configuration for the Sync Engine.
     * Uses a background thread pool for offline-first sync operations.
     */
    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setMinimumLoggingLevel(android.util.Log.INFO)
            .build()
}
