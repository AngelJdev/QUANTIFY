package com.quantify.smartwatch.ui.theme

import androidx.compose.runtime.*
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.wear.compose.material.Colors
import androidx.wear.compose.material.MaterialTheme
import com.quantify.smartwatch.data.preferences.UserPreferences

/**
 * Quantify Theme Colors definition.
 * Used dynamically by all smartwatch screens via LocalQuantifyColors.current.
 */
data class QuantifyColors(
    val primary: Color,
    val primaryLight: Color,
    val primaryDark: Color,
    val background: Color,
    val surface: Color,
    val card: Color,
    val textPrimary: Color,
    val textSecondary: Color,
    val textDisabled: Color,
    val ring: Color,
    val ringBg: Color,
    val streak: Color,
    val success: Color,
    val warning: Color,
    val error: Color,
    val onPrimary: Color,
    val isLight: Boolean
)

val ClasicoColors = QuantifyColors(
    primary = Color(0xFF00E5FF),
    primaryLight = Color(0xFF80D8FF),
    primaryDark = Color(0xFF00B8D4),
    background = Color(0xFF0A0A0F),
    surface = Color(0xFF12121A),
    card = Color(0xFF1A1A25),
    textPrimary = Color(0xFFF0F0F5),
    textSecondary = Color(0xFF8A8A9A),
    textDisabled = Color(0xFF4A4A5A),
    ring = Color(0xFF00E5FF),
    ringBg = Color(0xFF1A1A25),
    streak = Color(0xFFFF6D00),
    success = Color(0xFF00E676),
    warning = Color(0xFFFFB300),
    error = Color(0xFFFF5252),
    onPrimary = Color(0xFF0A0A0F),
    isLight = false
)

val BlackWhiteColors = QuantifyColors(
    primary = Color(0xFFFFFFFF),
    primaryLight = Color(0xFFFFFFFF),
    primaryDark = Color(0xFFB0B0B0),
    background = Color(0xFF000000),
    surface = Color(0xFF141414),
    card = Color(0xFF222222),
    textPrimary = Color(0xFFFFFFFF),
    textSecondary = Color(0xFFAAAAAA),
    textDisabled = Color(0xFF555555),
    ring = Color(0xFFFFFFFF),
    ringBg = Color(0xFF222222),
    streak = Color(0xFFFFFFFF),
    success = Color(0xFFFFFFFF),
    warning = Color(0xFFCCCCCC),
    error = Color(0xFFFF5252),
    onPrimary = Color(0xFF000000),
    isLight = false
)

val GirlyColors = QuantifyColors(
    primary = Color(0xFFFF4081),
    primaryLight = Color(0xFFFF80AB),
    primaryDark = Color(0xFFF50057),
    background = Color(0xFF180A16),
    surface = Color(0xFF280F25),
    card = Color(0xFF381534),
    textPrimary = Color(0xFFFFF0F7),
    textSecondary = Color(0xFFF48FB1),
    textDisabled = Color(0xFF8A506D),
    ring = Color(0xFFFF4081),
    ringBg = Color(0xFF381534),
    streak = Color(0xFFFF4081),
    success = Color(0xFF00E676),
    warning = Color(0xFFFFB300),
    error = Color(0xFFFF5252),
    onPrimary = Color(0xFF180A16),
    isLight = false
)

val ClaroColors = QuantifyColors(
    primary = Color(0xFF0288D1),
    primaryLight = Color(0xFF03A9F4),
    primaryDark = Color(0xFF01579B),
    background = Color(0xFFF5F7FB),
    surface = Color(0xFFFFFFFF),
    card = Color(0xFFE4E8F0),
    textPrimary = Color(0xFF1A1D24),
    textSecondary = Color(0xFF5A6270),
    textDisabled = Color(0xFF9AA0AC),
    ring = Color(0xFF0288D1),
    ringBg = Color(0xFFDCE2EC),
    streak = Color(0xFFFF6D00),
    success = Color(0xFF00C853),
    warning = Color(0xFFF57C00),
    error = Color(0xFFD32F2F),
    onPrimary = Color(0xFFFFFFFF),
    isLight = true
)

val LocalQuantifyColors = staticCompositionLocalOf { ClasicoColors }

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

    val quantifyColors = when (currentTheme) {
        "BLACK_WHITE" -> BlackWhiteColors
        "GIRLY" -> GirlyColors
        "CLARO" -> ClaroColors
        else -> ClasicoColors
    }

    val palette = Colors(
        primary = quantifyColors.primary,
        primaryVariant = quantifyColors.primaryDark,
        secondary = quantifyColors.primaryLight,
        secondaryVariant = quantifyColors.primaryDark,
        background = quantifyColors.background,
        surface = quantifyColors.card,
        error = quantifyColors.error,
        onPrimary = quantifyColors.onPrimary,
        onSecondary = quantifyColors.onPrimary,
        onBackground = quantifyColors.textPrimary,
        onSurface = quantifyColors.textPrimary,
        onError = quantifyColors.textPrimary
    )

    CompositionLocalProvider(LocalQuantifyColors provides quantifyColors) {
        MaterialTheme(
            colors = palette,
            content = content
        )
    }
}


