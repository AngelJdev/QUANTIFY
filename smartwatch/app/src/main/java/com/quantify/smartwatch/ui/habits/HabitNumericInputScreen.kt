package com.quantify.smartwatch.ui.habits

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.InlineSlider
import androidx.wear.compose.material.InlineSliderDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import com.quantify.smartwatch.ui.viewmodel.HabitViewModel

/**
 * Screen 3.2b — Numeric / Time Input
 * InlineSlider to select a numeric value, then "Registrar" button.
 * Range is 0 to meta_diaria * 1.5 (allow exceeding goal).
 */
@Composable
fun HabitNumericInputScreen(
    habitId: Int,
    viewModel: HabitViewModel,
    onRegistered: () -> Unit
) {
    LaunchedEffect(habitId) { viewModel.loadHabit(habitId) }
    val habit by viewModel.selectedHabit.collectAsState()

    var currentValue by remember { mutableFloatStateOf(0f) }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        habit?.let { h ->
            val maxValue = ((h.meta_diaria ?: 100.0) * 1.5).toFloat()
            val step = if (h.tipo_medicion == "TIEMPO") 5f else 1f
            val typeColor = if (h.tipo_medicion == "TIEMPO") HabitTime else HabitNumeric

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.padding(horizontal = 12.dp)
            ) {
                Text(
                    text = h.nombre,
                    color = TextPrimary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    maxLines = 1
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Current value display
                Text(
                    text = "${currentValue.toInt()}",
                    color = typeColor,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = h.unidad ?: "",
                    color = TextSecondary,
                    fontSize = 12.sp
                )

                // Progress toward goal
                h.meta_diaria?.let { goal ->
                    Text(
                        text = "Meta: ${goal.toInt()} ${h.unidad ?: ""}",
                        color = TextDisabled,
                        fontSize = 10.sp
                    )
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Slider
                InlineSlider(
                    value = currentValue,
                    onValueChange = { currentValue = it },
                    valueRange = 0f..maxValue,
                    steps = ((maxValue / step) - 1).toInt().coerceAtLeast(0),
                    segmented = false,
                    increaseIcon = { InlineSliderDefaults.Increase },
                    decreaseIcon = { InlineSliderDefaults.Decrease },
                    colors = InlineSliderDefaults.colors(
                        selectedBarColor = typeColor
                    ),
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                Button(
                    onClick = {
                        viewModel.registerValue(habitId, currentValue.toDouble())
                        onRegistered()
                    },
                    colors = ButtonDefaults.buttonColors(backgroundColor = typeColor),
                    modifier = Modifier.height(36.dp)
                ) {
                    Text(
                        text = "Registrar",
                        color = BackgroundPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}
