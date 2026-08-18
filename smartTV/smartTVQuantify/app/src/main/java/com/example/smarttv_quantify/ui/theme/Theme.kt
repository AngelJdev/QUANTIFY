package com.example.smarttv_quantify.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val QuantifyColorScheme = darkColorScheme(
    primary = QuantifyCyan,
    onPrimary = Color(0xFF001014),
    primaryContainer = QuantifySurfaceElevated,
    onPrimaryContainer = QuantifyTextPrimary,
    secondary = QuantifyBlueLight,
    onSecondary = Color.Black,
    tertiary = QuantifySuccess,
    background = QuantifyBlack,
    onBackground = QuantifyTextPrimary,
    surface = QuantifySurface,
    onSurface = QuantifyTextPrimary,
    surfaceVariant = QuantifySurfaceElevated,
    onSurfaceVariant = QuantifyTextMuted,
    outline = QuantifyBorder,
    error = QuantifyDanger,
    onError = Color.White
)

@Composable
fun SmartTVQuantifyTheme(
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = QuantifyColorScheme,
        typography = Typography,
        content = content
    )
}
