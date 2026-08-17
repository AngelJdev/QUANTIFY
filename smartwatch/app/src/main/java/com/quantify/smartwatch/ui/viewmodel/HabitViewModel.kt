package com.quantify.smartwatch.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.quantify.smartwatch.data.local.QuantifyDatabase
import com.quantify.smartwatch.data.local.entity.CachedHabitEntity
import com.quantify.smartwatch.data.preferences.UserPreferences
import com.quantify.smartwatch.data.repository.HabitRepository
import com.quantify.smartwatch.data.repository.LogRepository
import com.quantify.smartwatch.sync.SyncWorker
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * ViewModel for Habit management (Module 3).
 * Handles: habit list, completion (boolean + numeric), and day status.
 */
class HabitViewModel(application: Application) : AndroidViewModel(application) {

    private val db = QuantifyDatabase.getInstance(application)
    private val habitRepo = HabitRepository(db.habitDao())
    private val logRepo = LogRepository(db.actionQueueDao())
    private val prefs = UserPreferences(application)

    val habits: StateFlow<List<CachedHabitEntity>> = habitRepo.getActiveHabits()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    private val _selectedHabit = MutableStateFlow<CachedHabitEntity?>(null)
    val selectedHabit: StateFlow<CachedHabitEntity?> = _selectedHabit.asStateFlow()

    private val _allCompleted = MutableStateFlow(false)
    val allCompleted: StateFlow<Boolean> = _allCompleted.asStateFlow()

    fun loadHabit(habitId: Int) {
        viewModelScope.launch {
            _selectedHabit.value = habitRepo.getHabitById(habitId)
        }
    }

    /**
     * Complete a boolean habit.
     * 1. Mark completed in local cache (instant UI)
     * 2. Enqueue action for backend sync
     * 3. Trigger immediate sync to backend
     */
    fun completeHabit(habitId: Int) {
        viewModelScope.launch {
            habitRepo.markCompletedLocally(habitId)
            logRepo.enqueueHabitComplete(habitId)
            checkAllCompleted()
            SyncWorker.syncNow(getApplication())
        }
    }

    /**
     * Register a numeric/time value for a habit.
     * 1. Mark completed in local cache with value
     * 2. Enqueue action with value for backend sync
     * 3. Trigger immediate sync to backend
     */
    fun registerValue(habitId: Int, value: Double) {
        viewModelScope.launch {
            habitRepo.markCompletedLocally(habitId, value)
            logRepo.enqueueHabitLogValue(habitId, value)
            checkAllCompleted()
            SyncWorker.syncNow(getApplication())
        }
    }

    private suspend fun checkAllCompleted() {
        val total = habitRepo.getActiveCount()
        val completed = habitRepo.getCompletedTodayCount()
        _allCompleted.value = total > 0 && completed >= total
    }

    fun refreshHabits() {
        viewModelScope.launch {
            habitRepo.refreshFromRemote()
        }
    }
}
