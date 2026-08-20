package com.quantify.smartwatch.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.quantify.smartwatch.data.preferences.UserPreferences
import com.quantify.smartwatch.data.remote.RetrofitClient
import com.quantify.smartwatch.data.remote.dto.DailyPerformanceDto
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * ViewModel for Progress & Gamification (Module 4).
 * Handles: weekly chart data, streak stats, and adherence.
 */
class ProgressViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = UserPreferences(application)
    private val api = RetrofitClient.apiService

    val currentStreak: StateFlow<Int> = prefs.currentStreak
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val maxStreak: StateFlow<Int> = prefs.maxStreak
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    private val _weeklyData = MutableStateFlow<List<DailyPerformanceDto>>(emptyList())
    val weeklyData: StateFlow<List<DailyPerformanceDto>> = _weeklyData.asStateFlow()

    private val _adherenceScore = MutableStateFlow(0)
    val adherenceScore: StateFlow<Int> = _adherenceScore.asStateFlow()

    init {
        loadWeeklyData()
    }

    fun loadWeeklyData() {
        if (!RetrofitClient.hasToken()) return
        viewModelScope.launch {
            try {
                val response = api.getGlobalStats()
                if (response.isSuccessful && response.body()?.success == true) {
                    val stats = response.body()!!.data!!
                    // Get last 7 days for weekly chart
                    _weeklyData.value = stats.dailyPerformance.takeLast(7)
                    _adherenceScore.value = stats.globalScore
                }
            } catch (e: Exception) {
                // Offline — keep existing data
            }
        }
    }
}
