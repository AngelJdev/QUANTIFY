package com.quantify.smartwatch.ui.watchface

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
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
 * Shows: Network status, last sync time, pending queue actions, and manual sync trigger.
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
            modifier = Modifier.padding(horizontal = 14.dp)
        ) {
            Text(
                text = "ESTADO DEL SISTEMA",
                color = CyanPrimary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Connection status pill
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier
                    .background(BackgroundElevated, RoundedCornerShape(12.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(if (isOnline) Success else Warning, CircleShape)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = if (isOnline) "CONECTADO" else "OFFLINE",
                    color = if (isOnline) Success else Warning,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Last sync info
            Text(
                text = "Última sincronización:",
                color = TextDisabled,
                fontSize = 10.sp
            )
            Text(
                text = lastSyncText,
                color = TextPrimary,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold
            )

            // Pending actions
            if (pendingActions > 0) {
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "$pendingActions acción(es) en cola",
                    color = Warning,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Sync now button
            Button(
                onClick = onSyncNow,
                colors = ButtonDefaults.buttonColors(backgroundColor = CyanPrimary),
                modifier = Modifier.height(34.dp),
                enabled = isOnline
            ) {
                Text(
                    text = "SINCRONIZAR AHORA",
                    color = BackgroundPrimary,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }
    }
}

