package com.quantify.smartwatch.ui.progress

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 4.2 — Live Telemetry
 * Real-time heart rate from the watch sensor.
 * Clean, engineering-focused design without emojis.
 */
@Composable
fun LiveTelemetryScreen() {
    val context = LocalContext.current
    var heartRate by remember { mutableIntStateOf(0) }
    var sensorAvailable by remember { mutableStateOf(true) }

    val hasSensorPermission = ContextCompat.checkSelfPermission(
        context, Manifest.permission.BODY_SENSORS
    ) == PackageManager.PERMISSION_GRANTED

    DisposableEffect(hasSensorPermission) {
        if (!hasSensorPermission) {
            sensorAvailable = false
            onDispose {}
        } else {
            val sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
            val hrSensor = sensorManager.getDefaultSensor(Sensor.TYPE_HEART_RATE)

            if (hrSensor == null) {
                sensorAvailable = false
                onDispose {}
            } else {
                val listener = object : SensorEventListener {
                    override fun onSensorChanged(event: SensorEvent?) {
                        event?.values?.firstOrNull()?.let {
                            heartRate = it.toInt()
                        }
                    }
                    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
                }
                sensorManager.registerListener(listener, hrSensor, SensorManager.SENSOR_DELAY_NORMAL)
                onDispose {
                    sensorManager.unregisterListener(listener)
                }
            }
        }
    }

    val colors = LocalQuantifyColors.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(horizontal = 14.dp)
        ) {
            Text(
                text = "TELEMETRÍA CARDÍACA",
                color = colors.primary,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            if (!sensorAvailable) {
                Box(
                    modifier = Modifier
                        .background(colors.card, RoundedCornerShape(8.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "Sensor no disponible",
                        color = colors.textDisabled,
                        fontSize = 11.sp
                    )
                }
            } else {
                // Heart rate display
                Text(
                    text = if (heartRate > 0) "$heartRate" else "--",
                    color = colors.error,
                    fontSize = 38.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace
                )
                Text(
                    text = "LATIDOS POR MINUTO (BPM)",
                    color = colors.textSecondary,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.SemiBold
                )

                Spacer(modifier = Modifier.height(10.dp))

                // Heart rate zone badge
                val zoneText = when {
                    heartRate == 0 -> "BUSCANDO PULSO"
                    heartRate < 60 -> "REPOSO"
                    heartRate < 100 -> "NORMAL"
                    heartRate < 140 -> "CARDIO"
                    heartRate < 170 -> "INTENSO"
                    else -> "MÁXIMO"
                }
                val zoneColor = when {
                    heartRate == 0 -> colors.textDisabled
                    heartRate < 60 -> colors.primary
                    heartRate < 100 -> colors.success
                    heartRate < 140 -> colors.warning
                    heartRate < 170 -> colors.streak
                    else -> colors.error
                }

                Box(
                    modifier = Modifier
                        .background(zoneColor.copy(alpha = 0.15f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 10.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = zoneText,
                        color = zoneColor,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }
    }
}

