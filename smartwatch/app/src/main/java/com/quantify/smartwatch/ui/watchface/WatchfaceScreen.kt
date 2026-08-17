package com.quantify.smartwatch.ui.watchface

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
 * - Current date & time (large digital OLED display)
 * - Progress ring (% of habits completed today)
 * - Streak badge (high contrast, clean typography)
 * - Direct navigation buttons: Stopwatch (CRON), Habits, Settings (CFG)
 */
@Composable
fun WatchfaceScreen(
    completionPercent: Int,
    currentStreak: Int,
    completedToday: Int,
    totalHabits: Int,
    onNavigateToHabits: () -> Unit,
    onNavigateToStopwatch: () -> Unit = {},
    onNavigateToSettings: () -> Unit = {}
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        // Perimeter circular progress ring
        CircularProgressIndicator(
            progress = (completionPercent / 100f).coerceIn(0f, 1f),
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            startAngle = 270f,
            endAngle = 270f + 360f,
            indicatorColor = CyanPrimary,
            trackColor = ProgressRingBg,
            strokeWidth = 5.dp
        )

        // Center content & navigation
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 12.dp)
        ) {
            // Current Date (e.g., "SÁB, 16 AGO")
            val dateFormat = SimpleDateFormat("EEE, dd MMM", Locale("es", "ES"))
            Text(
                text = dateFormat.format(Date()).uppercase(Locale.ROOT),
                color = CyanLight,
                fontSize = 9.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(1.dp))

            // Current Time (Large Monospace)
            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            Text(
                text = timeFormat.format(Date()),
                color = TextPrimary,
                fontSize = 34.sp,
                fontWeight = FontWeight.ExtraBold,
                fontFamily = FontFamily.Monospace
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Stats row: Habits Count + Streak Pill
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Habits progress
                Text(
                    text = "$completedToday/$totalHabits",
                    color = if (completedToday >= totalHabits && totalHabits > 0) Success else TextPrimary,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = " HÁBITOS",
                    color = TextSecondary,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.width(8.dp))

                // Minimalist Streak Badge
                Box(
                    modifier = Modifier
                        .background(StreakFire.copy(alpha = 0.2f), RoundedCornerShape(4.dp))
                        .padding(horizontal = 5.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = "$currentStreak D",
                        color = StreakFire,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Navigation Bar: Stopwatch (CRON) | Habits (HÁBITOS) | Settings (CFG)
            Row(
                horizontalArrangement = Arrangement.spacedBy(5.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(0.92f)
            ) {
                // Stopwatch Navigation
                Button(
                    onClick = onNavigateToStopwatch,
                    colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.size(34.dp)
                ) {
                    Text(
                        text = "⏱",
                        color = CyanPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Main Habit List
                Chip(
                    onClick = onNavigateToHabits,
                    colors = ChipDefaults.chipColors(backgroundColor = CyanPrimary),
                    label = {
                        Text(
                            text = "HÁBITOS",
                            color = BackgroundPrimary,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.ExtraBold,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center,
                            letterSpacing = 0.5.sp
                        )
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(34.dp)
                )

                // Settings Navigation (Gear Symbol)
                Button(
                    onClick = onNavigateToSettings,
                    colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.size(34.dp)
                ) {
                    Text(
                        text = "⚙",
                        color = TextSecondary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

