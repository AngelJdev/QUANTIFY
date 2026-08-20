package com.quantify.smartwatch.ui.habits

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
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
    val colors = LocalQuantifyColors.current

    // Refresh habits from backend when entering the screen
    LaunchedEffect(Unit) {
        viewModel.refreshHabits()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background)
    ) {
        if (habits.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("Sin hábitos activos", color = colors.textSecondary, fontSize = 13.sp)
            }
        } else {
            ScalingLazyColumn(
                modifier = Modifier.fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                item {
                    Text(
                        text = "Mis Hábitos",
                        color = colors.primary,
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
    val colors = LocalQuantifyColors.current
    val typeLabel = when (habit.tipo_medicion) {
        "NUMERICO" -> "NUM"
        "TIEMPO" -> "MIN"
        else -> "OK"
    }
    val typeColor = when (habit.tipo_medicion) {
        "NUMERICO" -> if (colors.isLight) Color(0xFF5E35B1) else Color(0xFFB388FF)
        "TIEMPO" -> colors.streak
        else -> colors.primary
    }

    Chip(
        onClick = onClick,
        label = {
            Text(
                text = habit.nombre,
                color = colors.textPrimary,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                maxLines = 1
            )
        },
        secondaryLabel = {
            if (habit.completado_hoy) {
                Text("COMPLETADO", color = colors.success, fontSize = 9.sp, fontWeight = FontWeight.Bold)
            } else {
                habit.meta_diaria?.let { meta ->
                    Text(
                        text = "${habit.valor_hoy?.toInt() ?: 0}/${meta.toInt()} ${habit.unidad ?: ""}",
                        color = colors.textSecondary,
                        fontSize = 9.sp
                    )
                }
            }
        },
        icon = {
            Box(
                modifier = Modifier
                    .size(22.dp)
                    .background(typeColor.copy(alpha = 0.2f), androidx.compose.foundation.shape.CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = typeLabel,
                    color = typeColor,
                    fontSize = 7.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        },
        colors = ChipDefaults.chipColors(backgroundColor = colors.card),
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 6.dp, vertical = 2.dp)
    )
}

