package com.quantify.smartwatch.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import kotlinx.coroutines.delay

/**
 * Screen 1.1 — Splash Screen
 * Static QUANTIFY logo for 2 seconds, then navigates forward.
 */
@Composable
fun SplashScreen(onFinished: () -> Unit) {
    val colors = LocalQuantifyColors.current

    LaunchedEffect(Unit) {
        delay(2000)
        onFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "Q",
                color = colors.primary,
                fontSize = 48.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "QUANTIFY",
                color = colors.primary,
                fontSize = 14.sp,
                fontWeight = FontWeight.Light,
                letterSpacing = 4.sp
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "SMARTWATCH",
                color = colors.textSecondary,
                fontSize = 10.sp,
                letterSpacing = 2.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}
