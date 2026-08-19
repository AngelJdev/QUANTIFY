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
        startPeriodicCheck()
    }

    private fun startPeriodicCheck() {
        viewModelScope.launch {
            while (true) {
                kotlinx.coroutines.delay(5000) // Check every 5s for real-time sync / unlinking
                if (RetrofitClient.hasToken()) {
                    fetchRemoteDashboard()
                }
            }
        }
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

            if (RetrofitClient.hasToken()) {
                fetchRemoteDashboard()
            }
        }
    }

    private suspend fun fetchRemoteDashboard() {
        if (!RetrofitClient.hasToken()) return
        try {
            val response = RetrofitClient.apiService.getDashboard()
            if (response.isSuccessful && response.body()?.success == true) {
                val data = response.body()!!.data
                if (data != null) {
                    _totalHabits.value = data.stats.totalHabits
                    _completedToday.value = data.stats.completedToday
                    _completionPercent.value = data.stats.completionPercent
                    prefs.updateStreaks(data.user.current_streak, data.user.max_streak)

                    // Persist habits from dashboard into Room so HabitListScreen displays active habits
                    val entities = data.habits.map { dto ->
                        com.quantify.smartwatch.data.local.entity.CachedHabitEntity(
                            id = dto.id,
                            usuario_id = dto.usuario_id,
                            nombre = dto.nombre,
                            descripcion = dto.descripcion,
                            tipo_medicion = dto.tipo_medicion,
                            meta_diaria = dto.meta_diaria,
                            unidad = dto.unidad,
                            frecuencia = dto.frecuencia,
                            activo = dto.activo,
                            completado_hoy = dto.completado_hoy,
                            valor_hoy = dto.valor_hoy
                        )
                    }
                    db.habitDao().clearAll()
                    if (entities.isNotEmpty()) {
                        db.habitDao().insertAll(entities)
                    }
                }
                _isOnline.value = true
            } else if ((response.code() == 401 || response.code() == 403) && RetrofitClient.hasToken()) {
                RetrofitClient.onUnauthorized?.invoke()
            }
        } catch (e: Exception) {
            _isOnline.value = false
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
