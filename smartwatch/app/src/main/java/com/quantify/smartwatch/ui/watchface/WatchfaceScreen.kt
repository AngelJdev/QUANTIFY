package com.quantify.smartwatch.ui.watchface

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import com.quantify.smartwatch.ui.theme.*
import java.text.SimpleDateFormat
import java.util.*

/**
 * Screen 2.1 — Watchface / Dashboard
 * Central view showing:
 * - Current time (large, center)
 * - Progress ring (% of habits completed today)
 * - Streak badge (fire icon + days)
 * Tap on the ring navigates to habit list (Module 3).
 */
@Composable
fun WatchfaceScreen(
    completionPercent: Int,
    currentStreak: Int,
    completedToday: Int,
    totalHabits: Int,
    onTapRing: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary)
            .clickable { onTapRing() },
        contentAlignment = Alignment.Center
    ) {
        // TimeText at top
        TimeText()

        // Progress ring (perimeter)
        CircularProgressIndicator(
            progress = completionPercent / 100f,
            modifier = Modifier
                .fillMaxSize()
                .padding(6.dp),
            startAngle = 270f,
            endAngle = 270f + 360f,
            indicatorColor = ProgressRing,
            trackColor = ProgressRingBg,
            strokeWidth = 8.dp,
            strokeCap = StrokeCap.Round
        )

        // Center content
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // Current time
            val timeFormat = SimpleDateFormat("HH:mm", Locale.getDefault())
            Text(
                text = timeFormat.format(Date()),
                color = TextPrimary,
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Completion summary
            Text(
                text = "$completedToday/$totalHabits hábitos",
                color = TextSecondary,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Streak badge
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "🔥",
                    fontSize = 14.sp
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "$currentStreak días",
                    color = StreakFire,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}
