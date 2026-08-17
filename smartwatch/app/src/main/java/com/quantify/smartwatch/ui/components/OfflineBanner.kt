package com.quantify.smartwatch.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * OfflineBanner — State indicator E.1
 * Shown at the top of screens when WiFi is disconnected.
 */
@Composable
fun OfflineBanner(pendingActions: Int = 0) {
    val colors = LocalQuantifyColors.current

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(colors.warning.copy(alpha = 0.15f), RoundedCornerShape(4.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "📡 Sin conexión",
                color = colors.warning,
                fontSize = 11.sp
            )
            if (pendingActions > 0) {
                Text(
                    text = "$pendingActions acciones pendientes",
                    color = colors.textSecondary,
                    fontSize = 9.sp
                )
            }
        }
    }
}
