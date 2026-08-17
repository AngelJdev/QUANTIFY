package com.quantify.smartwatch.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 1.5 — Waiting for Authorization
 * Circular loader while polling the backend for user confirmation from the web.
 */
@Composable
fun WaitingAuthScreen() {
    val colors = LocalQuantifyColors.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background),
        contentAlignment = Alignment.Center
    ) {
        // Outer progress ring
        CircularProgressIndicator(
            modifier = Modifier.fillMaxSize().padding(4.dp),
            indicatorColor = colors.ring,
            trackColor = colors.ringBg,
            strokeWidth = 4.dp
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Esperando\nautorización\ndesde la web…",
                color = colors.textPrimary,
                fontSize = 13.sp,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Ingresa el código en\ntu cuenta de Quantify",
                color = colors.textSecondary,
                fontSize = 10.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}
