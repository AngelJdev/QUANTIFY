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
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import com.quantify.smartwatch.ui.viewmodel.HabitViewModel

/**
 * Screen 3.2a — Habit Detail (Boolean)
 * Large habit name + single "Completar" button.
 * One tap to mark as done.
 */
@Composable
fun HabitDetailScreen(
    habitId: Int,
    viewModel: HabitViewModel,
    onCompleted: () -> Unit
) {
    LaunchedEffect(habitId) { viewModel.loadHabit(habitId) }
    val habit by viewModel.selectedHabit.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        habit?.let { h ->
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = h.nombre,
                    color = TextPrimary,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )

                h.descripcion?.let { desc ->
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = desc,
                        color = TextSecondary,
                        fontSize = 11.sp,
                        textAlign = TextAlign.Center,
                        maxLines = 2
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                if (h.completado_hoy) {
                    Text(
                        text = "COMPLETADO HOY",
                        color = Success,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                } else {
                    Button(
                        onClick = {
                            viewModel.completeHabit(habitId)
                            onCompleted()
                        },
                        colors = ButtonDefaults.buttonColors(backgroundColor = CyanPrimary),
                        modifier = Modifier
                            .fillMaxWidth(0.7f)
                            .height(44.dp)
                    ) {
                        Text(
                            text = "Completar",
                            color = BackgroundPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
