package com.quantify.smartwatch.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.quantify.smartwatch.data.local.QuantifyDatabase
import com.quantify.smartwatch.data.preferences.UserPreferences
import com.quantify.smartwatch.data.repository.AuthRepository
import com.quantify.smartwatch.sync.SyncWorker
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * ViewModel for Settings (Module 5).
 * Manages: sync frequency, vibration, unlink device.
 */
class SettingsViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = UserPreferences(application)
    private val authRepo = AuthRepository(prefs)
    private val db = QuantifyDatabase.getInstance(application)

    val userEmail: StateFlow<String?> = prefs.userEmail
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val syncInterval: StateFlow<Int> = prefs.syncInterval
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 15)

    val vibrationEnabled: StateFlow<Boolean> = prefs.vibrationEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    fun setSyncInterval(minutes: Int) {
        viewModelScope.launch {
            prefs.setSyncInterval(minutes)
            SyncWorker.schedulePeriodic(getApplication(), minutes.toLong())
        }
    }

    fun setVibration(enabled: Boolean) {
        viewModelScope.launch {
            prefs.setVibration(enabled)
        }
    }

    /**
     * Unlink device: notify backend, clear all local data, cancel sync, reset to initial state.
     */
    fun unlinkDevice(onComplete: () -> Unit) {
        viewModelScope.launch {
            try {
                com.quantify.smartwatch.data.remote.RetrofitClient.apiService.unlinkFromWatch()
            } catch (_: Exception) {}
            SyncWorker.cancelAll(getApplication())
            db.habitDao().clearAll()
            db.actionQueueDao().clearAll()
            db.telemetryDao().clearAll()
            authRepo.unlink()
            onComplete()
        }
    }
}
