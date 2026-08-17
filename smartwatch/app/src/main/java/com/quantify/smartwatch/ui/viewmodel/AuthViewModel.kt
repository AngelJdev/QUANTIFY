package com.quantify.smartwatch.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.quantify.smartwatch.data.preferences.UserPreferences
import com.quantify.smartwatch.data.remote.RetrofitClient
import com.quantify.smartwatch.data.repository.AuthRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * ViewModel for the auth/pairing flow (Module 1).
 * Manages: code generation, polling, WiFi check, and result states.
 */
class AuthViewModel(application: Application) : AndroidViewModel(application) {

    private val prefs = UserPreferences(application)
    private val authRepo = AuthRepository(prefs)

    // UI State
    private val _uiState = MutableStateFlow<AuthUiState>(AuthUiState.Loading)
    val uiState: StateFlow<AuthUiState> = _uiState.asStateFlow()

    private val _pairingCode = MutableStateFlow("")
    val pairingCode: StateFlow<String> = _pairingCode.asStateFlow()

    private var deviceId: String = ""
    private var pollingJob: kotlinx.coroutines.Job? = null

    init {
        checkExistingSession()
    }

    private fun checkExistingSession() {
        viewModelScope.launch {
            prefs.token.first()?.let { token ->
                if (token.isNotEmpty()) {
                    RetrofitClient.setToken(token)
                    _uiState.value = AuthUiState.Authenticated
                    return@launch
                }
            }
            _uiState.value = AuthUiState.NotConfigured
        }
    }

    fun startPairing() {
        pollingJob?.cancel()
        viewModelScope.launch {
            _uiState.value = AuthUiState.CheckingWifi

            // Check backend reachability (implies WiFi is working)
            val isReachable = authRepo.checkHealth()
            if (!isReachable) {
                _uiState.value = AuthUiState.WifiRequired
                return@launch
            }

            // Generate device ID and request pairing code
            deviceId = authRepo.generateDeviceId()
            _uiState.value = AuthUiState.GeneratingCode

            val result = authRepo.generatePairingCode(deviceId)
            result.onSuccess { code ->
                _pairingCode.value = code
                _uiState.value = AuthUiState.ShowingCode
                // Automatically start active background polling
                startPolling()
            }.onFailure {
                _uiState.value = AuthUiState.Error(it.message ?: "Error de conexión")
            }
        }
    }

    fun startPolling() {
        pollingJob?.cancel()
        pollingJob = viewModelScope.launch {
            var attempts = 0
            val maxAttempts = 60 // 2.5 minutes at 2.5-second intervals

            while (attempts < maxAttempts) {
                val result = authRepo.pollAuth(deviceId)
                result.onSuccess { poll ->
                    if (poll.authorized) {
                        _uiState.value = AuthUiState.Success(poll.user?.email ?: "")
                        delay(1500)
                        _uiState.value = AuthUiState.Authenticated
                        return@launch
                    }
                }
                attempts++
                delay(2500) // Fast 2.5s interval for instant response
            }

            // Code expired — regenerate automatically
            regenerateCode()
        }
    }

    fun regenerateCode() {
        startPairing()
    }

    fun retryConnection() {
        startPairing()
    }

    fun unlinkLocal() {
        pollingJob?.cancel()
        viewModelScope.launch {
            authRepo.unlink()
            _uiState.value = AuthUiState.NotConfigured
        }
    }
}

sealed class AuthUiState {
    data object Loading : AuthUiState()
    data object NotConfigured : AuthUiState()
    data object CheckingWifi : AuthUiState()
    data object WifiRequired : AuthUiState()
    data object GeneratingCode : AuthUiState()
    data object ShowingCode : AuthUiState()
    data object WaitingAuth : AuthUiState()
    data class Success(val email: String) : AuthUiState()
    data object CodeExpired : AuthUiState()
    data class Error(val message: String) : AuthUiState()
    data object Authenticated : AuthUiState()
}
