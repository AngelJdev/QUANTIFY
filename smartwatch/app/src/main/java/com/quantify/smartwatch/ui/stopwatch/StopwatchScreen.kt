package com.quantify.smartwatch.ui.stopwatch

import android.content.Context
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import kotlinx.coroutines.delay
import java.util.Locale

enum class TimingMode {
    STOPWATCH,
    TIMER
}

/**
 * Screen — Unified Stopwatch & Countdown Timer
 * Real-time stopwatch and customizable countdown timer with haptic alerts.
 * Clean, circular icon-based controls with no clipped text.
 */
@Composable
fun StopwatchScreen(
    onBack: () -> Unit = {}
) {
    var mode by remember { mutableStateOf(TimingMode.STOPWATCH) }

    // Stopwatch State
    var isSwRunning by remember { mutableStateOf(false) }
    var swElapsedMillis by remember { mutableLongStateOf(0L) }
    var swLastStartTime by remember { mutableLongStateOf(0L) }

    LaunchedEffect(isSwRunning) {
        if (isSwRunning) {
            swLastStartTime = System.currentTimeMillis() - swElapsedMillis
            while (isSwRunning) {
                swElapsedMillis = System.currentTimeMillis() - swLastStartTime
                delay(30)
            }
        }
    }

    // Timer State
    var timerDurationSeconds by remember { mutableIntStateOf(5 * 60) } // default 5m
    var timerRemainingMillis by remember { mutableLongStateOf(5 * 60 * 1000L) }
    var isTimerRunning by remember { mutableStateOf(false) }
    val context = LocalContext.current

    LaunchedEffect(isTimerRunning) {
        if (isTimerRunning) {
            var lastTime = System.currentTimeMillis()
            while (isTimerRunning && timerRemainingMillis > 0L) {
                val now = System.currentTimeMillis()
                val delta = now - lastTime
                lastTime = now
                timerRemainingMillis = (timerRemainingMillis - delta).coerceAtLeast(0L)
                if (timerRemainingMillis <= 0L) {
                    isTimerRunning = false
                    val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                    vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 300, 150, 300, 150, 500), -1))
                }
                delay(50)
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        if (mode == TimingMode.STOPWATCH) {
            // Stopwatch Outer Ring
            val progress = (swElapsedMillis % 60000L) / 60000f
            CircularProgressIndicator(
                progress = if (swElapsedMillis > 0) progress else 0f,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(8.dp),
                startAngle = 270f,
                endAngle = 270f + 360f,
                indicatorColor = if (isSwRunning) CyanPrimary else CyanDark,
                trackColor = ProgressRingBg,
                strokeWidth = 4.dp
            )

            val totalSec = swElapsedMillis / 1000
            val min = totalSec / 60
            val sec = totalSec % 60
            val millisFraction = ((swElapsedMillis % 1000) / 10).toInt()

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.padding(horizontal = 14.dp)
            ) {
                // Mode Toggle Header
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(CyanPrimary.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "CRONÓMETRO",
                            color = CyanPrimary,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    Button(
                        onClick = { mode = TimingMode.TIMER },
                        colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                        modifier = Modifier.size(22.dp)
                    ) {
                        Text("⏳", fontSize = 9.sp)
                    }
                }

                // Main Stopwatch Time Display
                Text(
                    text = String.format(Locale.US, "%02d:%02d", min, sec),
                    color = TextPrimary,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )

                Text(
                    text = String.format(Locale.US, ".%02d", millisFraction),
                    color = if (isSwRunning) CyanLight else TextSecondary,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold,
                    fontFamily = FontFamily.Monospace
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Control Buttons (Circular Icon Buttons)
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (swElapsedMillis > 0 && !isSwRunning) {
                        // Reset circular icon button
                        Button(
                            onClick = { swElapsedMillis = 0L },
                            colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                            modifier = Modifier.size(36.dp)
                        ) {
                            Text(
                                text = "↺",
                                color = TextPrimary,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Play / Pause circular icon button
                    Button(
                        onClick = { isSwRunning = !isSwRunning },
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = if (isSwRunning) Warning else CyanPrimary
                        ),
                        modifier = Modifier.size(38.dp)
                    ) {
                        Text(
                            text = if (isSwRunning) "⏸" else "▶",
                            color = BackgroundPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        } else {
            // Timer Mode
            val totalTimerMillis = timerDurationSeconds * 1000L
            val timerProgress = if (totalTimerMillis > 0) (timerRemainingMillis.toFloat() / totalTimerMillis) else 0f

            CircularProgressIndicator(
                progress = timerProgress.coerceIn(0f, 1f),
                modifier = Modifier
                    .fillMaxSize()
                    .padding(8.dp),
                startAngle = 270f,
                endAngle = 270f + 360f,
                indicatorColor = if (timerRemainingMillis <= 10000L && isTimerRunning) Error else CyanPrimary,
                trackColor = ProgressRingBg,
                strokeWidth = 4.dp
            )

            val tSec = (timerRemainingMillis / 1000)
            val tMin = tSec / 60
            val tRemainingSec = tSec % 60

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.padding(horizontal = 14.dp)
            ) {
                // Mode Toggle Header
                Row(
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.padding(bottom = 2.dp)
                ) {
                    Button(
                        onClick = { mode = TimingMode.STOPWATCH },
                        colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                        modifier = Modifier.size(22.dp)
                    ) {
                        Text("⏱", fontSize = 9.sp)
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    Box(
                        modifier = Modifier
                            .background(CyanPrimary.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = "TEMPORIZADOR",
                            color = CyanPrimary,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.ExtraBold
                        )
                    }
                }

                // Preset selector when timer is not running
                if (!isTimerRunning && timerRemainingMillis == timerDurationSeconds * 1000L) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(vertical = 2.dp)
                    ) {
                        listOf(1, 5, 10, 25).forEach { mins ->
                            Box(
                                modifier = Modifier
                                    .background(
                                        if (timerDurationSeconds == mins * 60) CyanPrimary else BackgroundElevated,
                                        RoundedCornerShape(6.dp)
                                    )
                                    .padding(horizontal = 5.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "${mins}m",
                                    color = if (timerDurationSeconds == mins * 60) BackgroundPrimary else TextSecondary,
                                    fontSize = 8.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.clickable {
                                        timerDurationSeconds = mins * 60
                                        timerRemainingMillis = mins * 60 * 1000L
                                    }
                                )
                            }
                        }
                    }
                }

                // Countdown Time Display
                Text(
                    text = String.format(Locale.US, "%02d:%02d", tMin, tRemainingSec),
                    color = if (timerRemainingMillis == 0L) Success else TextPrimary,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )

                Spacer(modifier = Modifier.height(6.dp))

                // Controls
                Row(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (timerRemainingMillis < timerDurationSeconds * 1000L) {
                        Button(
                            onClick = {
                                isTimerRunning = false
                                timerRemainingMillis = timerDurationSeconds * 1000L
                            },
                            colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                            modifier = Modifier.size(36.dp)
                        ) {
                            Text("↺", color = TextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Button(
                        onClick = {
                            if (timerRemainingMillis == 0L) {
                                timerRemainingMillis = timerDurationSeconds * 1000L
                            }
                            isTimerRunning = !isTimerRunning
                        },
                        colors = ButtonDefaults.buttonColors(
                            backgroundColor = if (isTimerRunning) Warning else CyanPrimary
                        ),
                        modifier = Modifier.size(38.dp)
                    ) {
                        Text(
                            text = if (isTimerRunning) "⏸" else "▶",
                            color = BackgroundPrimary,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}
