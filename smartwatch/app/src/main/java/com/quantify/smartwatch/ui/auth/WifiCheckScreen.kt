package com.quantify.smartwatch.ui.auth

import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 1.3 — WiFi Required
 * Shown when the watch cannot reach the backend (no WiFi).
 * Button opens the native Wear OS WiFi settings.
 */
@Composable
fun WifiCheckScreen(onRetry: () -> Unit) {
    val context = LocalContext.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(16.dp)
        ) {
            Text(text = "📡", fontSize = 28.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Conecta tu reloj a\nuna red WiFi",
                color = TextPrimary,
                fontSize = 13.sp,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = {
                    context.startActivity(Intent(Settings.ACTION_WIFI_SETTINGS).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    })
                },
                colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated)
            ) {
                Text(
                    text = "Abrir Ajustes WiFi",
                    color = CyanPrimary,
                    fontSize = 12.sp
                )
            }
            Spacer(modifier = Modifier.height(8.dp))
            Button(
                onClick = onRetry,
                colors = ButtonDefaults.buttonColors(backgroundColor = CyanPrimary),
                modifier = Modifier.height(36.dp)
            ) {
                Text(
                    text = "Reintentar",
                    color = BackgroundPrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
