package com.quantify.smartwatch.ui.habits

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.data.local.entity.CachedHabitEntity
import com.quantify.smartwatch.ui.theme.*
import com.quantify.smartwatch.ui.viewmodel.HabitViewModel

/**
 * Screen 3.1 — Habit List
 * Scrollable list of today's habits with type icons and completion status.
 */
@Composable
fun HabitListScreen(
    viewModel: HabitViewModel,
    onHabitTap: (CachedHabitEntity) -> Unit,
    onAllCompleted: () -> Unit
) {
    val habits by viewModel.habits.collectAsState()
    val allCompleted by viewModel.allCompleted.collectAsState()

    LaunchedEffect(allCompleted) {
        if (allCompleted && habits.isNotEmpty()) onAllCompleted()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary)
    ) {
        if (habits.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Sin hábitos activos", color = TextSecondary, fontSize = 13.sp)
            }
        } else {
            ScalingLazyColumn(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                item {
                    Text(
                        text = "Mis Hábitos",
                        color = CyanPrimary,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(bottom = 4.dp)
                    )
                }
                items(habits) { habit ->
                    HabitChip(habit = habit, onClick = { onHabitTap(habit) })
                }
            }
        }
    }
}

@Composable
private fun HabitChip(habit: CachedHabitEntity, onClick: () -> Unit) {
    val typeIcon = when (habit.tipo_medicion) {
        "NUMERICO" -> "#"
        "TIEMPO" -> "⏱"
        else -> "✓"
    }
    val typeColor = when (habit.tipo_medicion) {
        "NUMERICO" -> HabitNumeric
        "TIEMPO" -> HabitTime
        else -> HabitBoolean
    }

    Chip(
        onClick = onClick,
        label = {
            Text(
                text = habit.nombre,
                color = TextPrimary,
                fontSize = 13.sp,
                maxLines = 1
            )
        },
        secondaryLabel = {
            if (habit.completado_hoy) {
                Text("Completado ✔", color = Success, fontSize = 10.sp)
            } else {
                habit.meta_diaria?.let { meta ->
                    Text(
                        text = "${habit.valor_hoy?.toInt() ?: 0}/${meta.toInt()} ${habit.unidad ?: ""}",
                        color = TextSecondary,
                        fontSize = 10.sp
                    )
                }
            }
        },
        icon = {
            Text(text = typeIcon, color = typeColor, fontSize = 16.sp, fontWeight = FontWeight.Bold)
        },
        colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp, vertical = 2.dp)
    )
}
