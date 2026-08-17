package com.quantify.smartwatch.ui.stopwatch

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import kotlinx.coroutines.delay
import java.util.Locale

/**
 * Screen — Stopwatch / Cronómetro
 * Real-time stopwatch for tracking exercises, focus sessions, and time habits.
 * Clean, engineering-focused UI with millisecond precision and circular second-track.
 */
@Composable
fun StopwatchScreen(
    onBack: () -> Unit = {}
) {
    var isRunning by remember { mutableStateOf(false) }
    var elapsedMillis by remember { mutableLongStateOf(0L) }
    var lastStartTime by remember { mutableLongStateOf(0L) }

    LaunchedEffect(isRunning) {
        if (isRunning) {
            lastStartTime = System.currentTimeMillis() - elapsedMillis
            while (isRunning) {
                elapsedMillis = System.currentTimeMillis() - lastStartTime
                delay(30) // ~30 FPS UI update for smooth milliseconds
            }
        }
    }

    val totalSeconds = (elapsedMillis / 1000)
    val minutes = (totalSeconds / 60)
    val seconds = (totalSeconds % 60)
    val millisFraction = ((elapsedMillis % 1000) / 10).toInt()

    // Smooth circular progress based on seconds (0 to 60s cycle)
    val progress = (elapsedMillis % 60000L) / 60000f

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        // Outer ring showing second progression
        CircularProgressIndicator(
            progress = if (elapsedMillis > 0) progress else 0f,
            modifier = Modifier
                .fillMaxSize()
                .padding(8.dp),
            startAngle = 270f,
            endAngle = 270f + 360f,
            indicatorColor = if (isRunning) CyanPrimary else CyanDark,
            trackColor = ProgressRingBg,
            strokeWidth = 4.dp
        )

        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        ) {
            // Header Label
            Text(
                text = "CRONÓMETRO",
                color = CyanPrimary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Main Time Display: MM:SS
            Text(
                text = String.format(Locale.US, "%02d:%02d", minutes, seconds),
                color = TextPrimary,
                fontSize = 32.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )

            // Milliseconds fraction: .ss
            Text(
                text = String.format(Locale.US, ".%02d", millisFraction),
                color = if (isRunning) CyanLight else TextSecondary,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                fontFamily = FontFamily.Monospace
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Control Buttons Row: Start/Pause & Reset
            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Reset Button (enabled only when paused and time > 0)
                if (elapsedMillis > 0 && !isRunning) {
                    Button(
                        onClick = {
                            elapsedMillis = 0L
                        },
                        colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                        modifier = Modifier.size(38.dp)
                    ) {
                        Text(
                            text = "RST",
                            color = TextSecondary,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                // Primary Start / Pause Button
                Button(
                    onClick = {
                        isRunning = !isRunning
                    },
                    colors = ButtonDefaults.buttonColors(
                        backgroundColor = if (isRunning) Warning else CyanPrimary
                    ),
                    modifier = Modifier
                        .height(38.dp)
                        .padding(horizontal = 4.dp)
                ) {
                    Text(
                        text = if (isRunning) "PAUSAR" else if (elapsedMillis == 0L) "INICIAR" else "CONTINUAR",
                        color = BackgroundPrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }
        }
    }
}
