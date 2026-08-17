package com.quantify.smartwatch.ui.progress

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
            modifier = Modifier.padding(horizontal = 14.dp)
        ) {
            Text(
                text = "ESTADÍSTICAS DE RACHA",
                color = CyanPrimary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Current streak prominent display
            Box(
                modifier = Modifier
                    .background(BackgroundElevated, RoundedCornerShape(12.dp))
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "$currentStreak",
                        color = StreakFire,
                        fontSize = 28.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                    Text(
                        text = "DÍAS SEGUIDOS",
                        color = TextSecondary,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // Secondary stats row: Max Streak + Global Adherence
            Row(
                horizontalArrangement = Arrangement.SpaceEvenly,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Best streak
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "$maxStreak D",
                        color = CyanPrimary,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "RÉCORD",
                        color = TextDisabled,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Adherence
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "$adherence%",
                        color = Success,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "ADHERENCIA",
                        color = TextDisabled,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

