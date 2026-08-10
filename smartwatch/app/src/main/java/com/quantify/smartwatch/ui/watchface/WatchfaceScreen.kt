package com.quantify.smartwatch.ui.watchface

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

/**
 * Screen 2.1 — Watchface / Dashboard
 * Central view showing:
 * - Current time (large, center)
 * - Progress ring (% of habits completed today)
 * - Streak badge (fire icon + days)
 * - Direct navigation buttons to Habits, Progress, and Settings
 */
@Composable
fun WatchfaceScreen(
    completionPercent: Int,
    currentStreak: Int,
    completedToday: Int,
    totalHabits: Int,
    onNavigateToHabits: () -> Unit,
    onNavigateToProgress: () -> Unit = {},
    onNavigateToSettings: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        // Progress ring (perimeter)
        CircularProgressIndicator(
            progress = completionPercent / 100f,
            modifier = Modifier
                .fillMaxSize()
                .padding(10.dp),
            startAngle = 270f,
            endAngle = 270f + 360f,
            indicatorColor = ProgressRing,
            trackColor = ProgressRingBg,
            strokeWidth = 6.dp
        )

        // Center content & navigation
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 14.dp)
        ) {
            // Current time
            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            Text(
                text = timeFormat.format(Date()),
                color = TextPrimary,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Completion summary
            Text(
                text = "$completedToday/$totalHabits hábitos",
                color = TextSecondary,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Streak badge
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "🔥",
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.width(3.dp))
                Text(
                    text = "$currentStreak días",
                    color = StreakFire,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Navigation Bar: Progress (📊) | Habits (Chip) | Settings (⚙️)
            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(0.9f)
            ) {
                // Progreso
                Button(
                    onClick = onNavigateToProgress,
                    colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.size(34.dp)
                ) {
                    Text("📊", fontSize = 12.sp)
                }

                // Lista de Hábitos
                Chip(
                    onClick = onNavigateToHabits,
                    colors = ChipDefaults.chipColors(backgroundColor = CyanPrimary),
                    label = {
                        Text(
                            text = "Hábitos",
                            color = BackgroundPrimary,
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                    },
                    modifier = Modifier.weight(1f)
                )

                // Ajustes
                Button(
                    onClick = onNavigateToSettings,
                    colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.size(34.dp)
                ) {
                    Text("⚙️", fontSize = 12.sp)
                }
            }
        }
    }
}
