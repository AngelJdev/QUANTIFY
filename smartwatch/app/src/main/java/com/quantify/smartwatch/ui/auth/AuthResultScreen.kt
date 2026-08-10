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
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import kotlinx.coroutines.delay

/**
 * Screen 1.6 — Auth Result (Success / Failure)
 * Success: Shows check icon + email, auto-redirects to watchface after 2s.
 * Failure: Shows error icon + message + retry button.
 */
@Composable
fun AuthResultScreen(
    isSuccess: Boolean,
    email: String = "",
    errorMessage: String = "",
    onRetry: () -> Unit = {},
    onContinue: () -> Unit = {}
) {
    // Auto-redirect on success
    if (isSuccess) {
        LaunchedEffect(Unit) {
            delay(2000)
            onContinue()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(14.dp)
        ) {
            if (isSuccess) {
                // Success state
                Text(
                    text = "✔",
                    fontSize = 44.sp,
                    color = Success
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "¡Vinculado!",
                    color = TextPrimary,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = email,
                    color = CyanPrimary,
                    fontSize = 11.sp,
                    textAlign = TextAlign.Center
                )
            } else {
                // Error state
                Text(
                    text = "✖",
                    fontSize = 44.sp,
                    color = Error
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = errorMessage.ifEmpty { "Error de conexión" },
                    color = TextPrimary,
                    fontSize = 12.sp,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(10.dp))
                Chip(
                    onClick = onRetry,
                    colors = ChipDefaults.chipColors(backgroundColor = CyanPrimary),
                    label = {
                        Text(
                            text = "Reintentar",
                            color = BackgroundPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )
                    },
                    modifier = Modifier.fillMaxWidth(0.85f)
                )
            }
        }
    }
}
