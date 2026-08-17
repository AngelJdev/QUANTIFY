package com.quantify.smartwatch.ui.theme

import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme
import com.quantify.smartwatch.data.preferences.UserPreferences

enum class WatchThemeType(val id: String, val title: String, val badge: String) {
    CLASICO("CLASICO", "Clásico", "💎"),
    BLACK_WHITE("BLACK_WHITE", "B&W", "⚪"),
    GIRLY("GIRLY", "Girly 💖💖💖", "💖"),
    CLARO("CLARO", "Claro", "☀️")
}

@Composable
fun QuantifyWatchTheme(
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val prefs = remember { UserPreferences(context) }
    val currentTheme by prefs.theme.collectAsState(initial = "CLASICO")

    val (primary, bg, elevated, textP, textS) = when (currentTheme) {
        "BLACK_WHITE" -> listOf(Color(0xFFFFFFFF), Color(0xFF000000), Color(0xFF222222), Color(0xFFFFFFFF), Color(0xFFAAAAAA))
        "GIRLY" -> listOf(Color(0xFFFF4081), Color(0xFF180A16), Color(0xFF33142F), Color(0xFFFFF0F6), Color(0xFFE191B9))
        "CLARO" -> listOf(Color(0xFF0091EA), Color(0xFFF5F6FA), Color(0xFFE1E5EA), Color(0xFF1A1A25), Color(0xFF606770))
        else -> listOf(CyanPrimary, BackgroundPrimary, BackgroundElevated, TextPrimary, TextSecondary) // CLASICO
    }

    val palette = Colors(
        primary = primary,
        primaryVariant = primary,
        secondary = primary,
        secondaryVariant = primary,
        background = bg,
        surface = elevated,
        error = Error,
        onPrimary = if (currentTheme == "CLARO") Color.White else BackgroundPrimary,
        onSecondary = if (currentTheme == "CLARO") Color.White else BackgroundPrimary,
        onBackground = textP,
        onSurface = textP,
        onError = textP
    )

    MaterialTheme(
        colors = palette,
        content = content
    )
}

