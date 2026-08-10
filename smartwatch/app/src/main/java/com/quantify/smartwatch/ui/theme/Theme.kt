package com.quantify.smartwatch.ui.theme

import androidx.compose.runtime.Composable
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Colors

private val QuantifyColorPalette = Colors(
    primary = CyanPrimary,
    primaryVariant = CyanDark,
    secondary = CyanLight,
    secondaryVariant = CyanDark,
    background = BackgroundPrimary,
    surface = BackgroundSurface,
    error = Error,
    onPrimary = BackgroundPrimary,
    onSecondary = BackgroundPrimary,
    onBackground = TextPrimary,
    onSurface = TextPrimary,
    onError = TextPrimary
)

@Composable
fun QuantifyWatchTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colors = QuantifyColorPalette,
        content = content
    )
}
