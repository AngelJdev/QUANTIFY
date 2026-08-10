package com.quantify.smartwatch.ui.progress

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.data.remote.dto.DailyPerformanceDto
import com.quantify.smartwatch.ui.theme.*
import com.quantify.smartwatch.ui.viewmodel.ProgressViewModel

/**
 * Screen 4.1 — Weekly Summary
 * Bar chart showing daily completion percentage for the last 7 days.
 */
@Composable
fun WeeklySummaryScreen(viewModel: ProgressViewModel) {
    val weeklyData by viewModel.weeklyData.collectAsState()
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
            modifier = Modifier.padding(12.dp)
        ) {
            Text(
                text = "Resumen Semanal",
                color = CyanPrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Mini bar chart
            if (weeklyData.isNotEmpty()) {
                WeeklyBarChart(
                    data = weeklyData,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(60.dp)
                )
            } else {
                Text(
                    text = "Sin datos disponibles",
                    color = TextDisabled,
                    fontSize = 11.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Adherence score
            Text(
                text = "Adherencia: $adherence%",
                color = TextPrimary,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
        }
    }
}

@Composable
private fun WeeklyBarChart(data: List<DailyPerformanceDto>, modifier: Modifier = Modifier) {
    val dayLabels = listOf("L", "M", "X", "J", "V", "S", "D")

    Canvas(modifier = modifier) {
        val barWidth = size.width / (data.size * 2f)
        val maxHeight = size.height - 16.dp.toPx()

        data.forEachIndexed { index, day ->
            val barHeight = (day.porcentaje / 100f) * maxHeight
            val x = (index * 2 + 0.5f) * barWidth
            val color = when {
                day.porcentaje >= 80 -> Success
                day.porcentaje >= 50 -> Warning
                day.porcentaje > 0 -> Error
                else -> ProgressRingBg
            }

            // Bar
            drawRect(
                color = color,
                topLeft = Offset(x, maxHeight - barHeight),
                size = Size(barWidth, barHeight)
            )

            // Background track
            drawRect(
                color = ProgressRingBg,
                topLeft = Offset(x, 0f),
                size = Size(barWidth, maxHeight - barHeight)
            )
        }
    }
}
