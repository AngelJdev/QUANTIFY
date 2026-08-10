package com.quantify.smartwatch.ui.habits

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
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

/**
 * Screen 3.4 — Day Complete (Empty State)
 * Shown when ALL habits for today are marked as completed.
 * Congratulation message + link to weekly summary.
 */
@Composable
fun DayCompleteScreen(onViewSummary: () -> Unit) {
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
            Text(text = "🏆", fontSize = 40.sp)
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Día completado",
                color = Success,
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Telemetría registrada.",
                color = TextSecondary,
                fontSize = 11.sp,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(14.dp))
            Button(
                onClick = onViewSummary,
                colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                modifier = Modifier.height(36.dp)
            ) {
                Text(
                    text = "Ver resumen",
                    color = CyanPrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
