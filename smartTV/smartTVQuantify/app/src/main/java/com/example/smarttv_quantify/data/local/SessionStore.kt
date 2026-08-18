package com.example.smarttv_quantify.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "quantify_tv_session")

data class Session(
    val loaded: Boolean = false,
    val serverUrl: String = "http://10.0.2.2:5000/api/",
    val token: String? = null,
    val userName: String? = null,
    val userEmail: String? = null
)

class SessionStore(private val context: Context) {

    val session: Flow<Session> = context.dataStore.data.map { prefs ->
        Session(
            loaded = true,
            serverUrl = prefs[KEY_SERVER_URL] ?: "http://10.0.2.2:5000/api/",
            token = prefs[KEY_TOKEN],
            userName = prefs[KEY_USER_NAME],
            userEmail = prefs[KEY_USER_EMAIL]
        )
    }

    suspend fun setServerUrl(url: String) {
        context.dataStore.edit { prefs ->
            prefs[KEY_SERVER_URL] = url
        }
    }

    suspend fun setSession(token: String, name: String?, email: String?) {
        context.dataStore.edit { prefs ->
            prefs[KEY_TOKEN] = token
            if (name != null) prefs[KEY_USER_NAME] = name else prefs.remove(KEY_USER_NAME)
            if (email != null) prefs[KEY_USER_EMAIL] = email else prefs.remove(KEY_USER_EMAIL)
        }
    }

    suspend fun clearSession() {
        context.dataStore.edit { prefs ->
            prefs.remove(KEY_TOKEN)
            prefs.remove(KEY_USER_NAME)
            prefs.remove(KEY_USER_EMAIL)
        }
    }

    private companion object {
        val KEY_SERVER_URL = stringPreferencesKey("server_url")
        val KEY_TOKEN = stringPreferencesKey("tv_token")
        val KEY_USER_NAME = stringPreferencesKey("user_name")
        val KEY_USER_EMAIL = stringPreferencesKey("user_email")
    }
}
