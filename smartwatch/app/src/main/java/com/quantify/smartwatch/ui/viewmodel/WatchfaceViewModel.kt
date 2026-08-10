package com.quantify.smartwatch.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.quantify.smartwatch.data.local.QuantifyDatabase
import com.quantify.smartwatch.data.preferences.UserPreferences
import com.quantify.smartwatch.data.remote.RetrofitClient
import com.quantify.smartwatch.data.remote.dto.GlobalStatsDto
import com.quantify.smartwatch.data.repository.HabitRepository
import com.quantify.smartwatch.sync.SyncWorker
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * ViewModel for the Watchface / Dashboard (Module 2).
 * Manages: completion percentage, streak data, sync status.
 */
class WatchfaceViewModel(application: Application) : AndroidViewModel(application) {

    private val db = QuantifyDatabase.getInstance(application)
    private val prefs = UserPreferences(application)
    private val habitRepo = HabitRepository(db.habitDao())

    val currentStreak: StateFlow<Int> = prefs.currentStreak
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val maxStreak: StateFlow<Int> = prefs.maxStreak
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val lastSync: StateFlow<Long> = prefs.lastSync
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0L)

    val userEmail: StateFlow<String?> = prefs.userEmail
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _completionPercent = MutableStateFlow(0)
    val completionPercent: StateFlow<Int> = _completionPercent.asStateFlow()

    private val _totalHabits = MutableStateFlow(0)
    val totalHabits: StateFlow<Int> = _totalHabits.asStateFlow()

    private val _completedToday = MutableStateFlow(0)
    val completedToday: StateFlow<Int> = _completedToday.asStateFlow()

    private val _isOnline = MutableStateFlow(true)
    val isOnline: StateFlow<Boolean> = _isOnline.asStateFlow()

    private val _pendingActions = MutableStateFlow(0)
    val pendingActions: StateFlow<Int> = _pendingActions.asStateFlow()

    private val _globalStats = MutableStateFlow<GlobalStatsDto?>(null)
    val globalStats: StateFlow<GlobalStatsDto?> = _globalStats.asStateFlow()

    init {
        loadDashboardData()
    }

    fun loadDashboardData() {
        viewModelScope.launch {
            // Local data
            val total = habitRepo.getActiveCount()
            val completed = habitRepo.getCompletedTodayCount()
            _totalHabits.value = total
            _completedToday.value = completed
            _completionPercent.value = if (total > 0) (completed * 100) / total else 0

            // Pending sync count
            _pendingActions.value = db.actionQueueDao().getPendingCount()

            // Try remote stats
            try {
                val response = RetrofitClient.apiService.getGlobalStats()
                if (response.isSuccessful && response.body()?.success == true) {
                    _globalStats.value = response.body()!!.data
                    _isOnline.value = true
                }
            } catch (e: Exception) {
                _isOnline.value = false
            }
        }
    }

    fun syncNow() {
        SyncWorker.syncNow(getApplication())
    }

    fun getTimeSinceLastSync(lastSyncTimestamp: Long): String {
        if (lastSyncTimestamp == 0L) return "Nunca"
        val diff = System.currentTimeMillis() - lastSyncTimestamp
        val minutes = diff / 60000
        return when {
            minutes < 1 -> "hace un momento"
            minutes < 60 -> "${minutes} min"
            minutes < 1440 -> "${minutes / 60} h"
            else -> "${minutes / 1440} d"
        }
    }
}
