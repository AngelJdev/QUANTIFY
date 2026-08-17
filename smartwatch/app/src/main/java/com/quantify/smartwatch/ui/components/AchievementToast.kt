package com.quantify.smartwatch.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import kotlinx.coroutines.delay

/**
 * AchievementToast — Notification N.2
 * Overlay toast shown when a new achievement is unlocked.
 * Auto-dismisses after 3 seconds.
 */
@Composable
fun AchievementToast(
    title: String,
    icon: String,
    onDismiss: () -> Unit
) {
    val colors = LocalQuantifyColors.current

    LaunchedEffect(Unit) {
        delay(3000)
        onDismiss()
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(8.dp)
            .background(colors.card, RoundedCornerShape(12.dp))
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(text = icon, fontSize = 20.sp)
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "¡Logro desbloqueado!",
                    color = colors.primary,
                    fontSize = 10.sp
                )
                Text(
                    text = title,
                    color = colors.textPrimary,
                    fontSize = 12.sp
                )
            }
        }
    }
}
