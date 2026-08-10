package com.quantify.smartwatch.ui.progress

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import com.quantify.smartwatch.ui.viewmodel.ProgressViewModel

/**
 * Screen 4.3 — Streak & Adherence Stats
 * Current streak, best streak, and monthly adherence percentage.
 */
@Composable
fun StreakStatsScreen(viewModel: ProgressViewModel) {
    val currentStreak by viewModel.currentStreak.collectAsState()
    val maxStreak by viewModel.maxStreak.collectAsState()
    val adherence by viewModel.adherenceScore.collectAsState()

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
            // Current streak
            Text(text = "🔥", fontSize = 28.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "$currentStreak",
                color = StreakFire,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Racha actual",
                color = TextSecondary,
                fontSize = 11.sp
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Stats row
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Best streak
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "$maxStreak",
                        color = CyanPrimary,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Mejor",
                        color = TextDisabled,
                        fontSize = 10.sp
                    )
                }

                // Adherence
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "$adherence%",
                        color = Success,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Adherencia",
                        color = TextDisabled,
                        fontSize = 10.sp
                    )
                }
            }
        }
    }
}
