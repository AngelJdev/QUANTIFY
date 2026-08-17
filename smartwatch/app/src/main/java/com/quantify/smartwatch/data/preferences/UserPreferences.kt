package com.quantify.smartwatch.data.preferences

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "quantify_prefs")

/**
 * DataStore for persisting user session and preferences.
 * Stores JWT token, user info, device ID, and sync configuration.
 */
class UserPreferences(private val context: Context) {

    companion object {
        val KEY_TOKEN = stringPreferencesKey("jwt_token")
        val KEY_USER_ID = intPreferencesKey("user_id")
        val KEY_USER_EMAIL = stringPreferencesKey("user_email")
        val KEY_USER_NAME = stringPreferencesKey("user_name")
        val KEY_DEVICE_ID = stringPreferencesKey("device_id")
        val KEY_IS_PAIRED = booleanPreferencesKey("is_paired")
        val KEY_CURRENT_STREAK = intPreferencesKey("current_streak")
        val KEY_MAX_STREAK = intPreferencesKey("max_streak")
        val KEY_SYNC_INTERVAL = intPreferencesKey("sync_interval_minutes")
        val KEY_VIBRATION_ENABLED = booleanPreferencesKey("vibration_enabled")
        val KEY_LAST_SYNC = longPreferencesKey("last_sync_timestamp")
        val KEY_THEME = stringPreferencesKey("app_theme")
    }

    val token: Flow<String?> = context.dataStore.data.map { it[KEY_TOKEN] }
    val isPaired: Flow<Boolean> = context.dataStore.data.map { it[KEY_IS_PAIRED] ?: false }
    val userEmail: Flow<String?> = context.dataStore.data.map { it[KEY_USER_EMAIL] }
    val userName: Flow<String?> = context.dataStore.data.map { it[KEY_USER_NAME] }
    val deviceId: Flow<String?> = context.dataStore.data.map { it[KEY_DEVICE_ID] }
    val currentStreak: Flow<Int> = context.dataStore.data.map { it[KEY_CURRENT_STREAK] ?: 0 }
    val maxStreak: Flow<Int> = context.dataStore.data.map { it[KEY_MAX_STREAK] ?: 0 }
    val syncInterval: Flow<Int> = context.dataStore.data.map { it[KEY_SYNC_INTERVAL] ?: 15 }
    val vibrationEnabled: Flow<Boolean> = context.dataStore.data.map { it[KEY_VIBRATION_ENABLED] ?: true }
    val lastSync: Flow<Long> = context.dataStore.data.map { it[KEY_LAST_SYNC] ?: 0L }
    val theme: Flow<String> = context.dataStore.data.map { it[KEY_THEME] ?: "CLASICO" }

    suspend fun saveSession(token: String, userId: Int, email: String, name: String) {
        context.dataStore.edit {
            it[KEY_TOKEN] = token
            it[KEY_USER_ID] = userId
            it[KEY_USER_EMAIL] = email
            it[KEY_USER_NAME] = name
            it[KEY_IS_PAIRED] = true
        }
    }

    suspend fun saveDeviceId(deviceId: String) {
        context.dataStore.edit { it[KEY_DEVICE_ID] = deviceId }
    }

    suspend fun updateStreaks(current: Int, max: Int) {
        context.dataStore.edit {
            it[KEY_CURRENT_STREAK] = current
            it[KEY_MAX_STREAK] = max
        }
    }

    suspend fun updateLastSync() {
        context.dataStore.edit { it[KEY_LAST_SYNC] = System.currentTimeMillis() }
    }

    suspend fun setSyncInterval(minutes: Int) {
        context.dataStore.edit { it[KEY_SYNC_INTERVAL] = minutes }
    }

    suspend fun setVibration(enabled: Boolean) {
        context.dataStore.edit { it[KEY_VIBRATION_ENABLED] = enabled }
    }

    suspend fun setTheme(themeName: String) {
        context.dataStore.edit { it[KEY_THEME] = themeName }
    }

    suspend fun clearAll() {
        context.dataStore.edit { it.clear() }
    }
}
