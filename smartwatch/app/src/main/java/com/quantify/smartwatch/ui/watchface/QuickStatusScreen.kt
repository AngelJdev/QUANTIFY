package com.quantify.smartwatch.ui.watchface

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 2.2 — Quick Status (Swipe down)
 * Shows: Battery, WiFi status, last sync time, pending actions, and sync button.
 */
@Composable
fun QuickStatusScreen(
    isOnline: Boolean,
    lastSyncText: String,
    pendingActions: Int,
    onSyncNow: () -> Unit
) {
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
            // Connection status
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = if (isOnline) "📶" else "📡",
                    fontSize = 16.sp
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isOnline) "Conectado" else "Sin conexión",
                    color = if (isOnline) Success else Warning,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Last sync
            Text(
                text = "Última sync: $lastSyncText",
                color = TextSecondary,
                fontSize = 11.sp
            )

            // Pending actions
            if (pendingActions > 0) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$pendingActions acciones pendientes",
                    color = Warning,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Sync now button
            Button(
                onClick = onSyncNow,
                colors = ButtonDefaults.buttonColors(backgroundColor = CyanPrimary),
                modifier = Modifier.height(36.dp),
                enabled = isOnline
            ) {
                Text(
                    text = "Sincronizar ahora",
                    color = BackgroundPrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
