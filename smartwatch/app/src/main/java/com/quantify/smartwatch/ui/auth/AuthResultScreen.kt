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
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
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
            verticalArrangement = Arrangement.Center
        ) {
            if (isSuccess) {
                // Success state
                Text(
                    text = "✔",
                    fontSize = 48.sp,
                    color = Success
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "¡Vinculado!",
                    color = TextPrimary,
                    fontSize = 16.sp,
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
                    fontSize = 48.sp,
                    color = Error
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = errorMessage.ifEmpty { "Error de conexión" },
                    color = TextPrimary,
                    fontSize = 13.sp,
                    textAlign = TextAlign.Center
                )
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = onRetry,
                    colors = ButtonDefaults.buttonColors(backgroundColor = CyanPrimary),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text(
                        text = "Reintentar",
                        color = BackgroundPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
