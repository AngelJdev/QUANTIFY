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
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 4.2 — Live Telemetry
 * Real-time heart rate from the watch sensor.
 * Falls back gracefully if BODY_SENSORS permission is denied or sensor unavailable.
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

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Telemetría en Vivo",
                color = CyanPrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(12.dp))

            if (!sensorAvailable) {
                Text(text = "💔", fontSize = 28.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Sensor no disponible",
                    color = TextSecondary,
                    fontSize = 12.sp
                )
            } else {
                // Heart rate display
                Text(text = "❤️", fontSize = 28.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (heartRate > 0) "$heartRate" else "--",
                    color = Error,
                    fontSize = 36.sp,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "BPM",
                    color = TextSecondary,
                    fontSize = 12.sp
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Heart rate zone
                val zoneText = when {
                    heartRate == 0 -> "Esperando datos..."
                    heartRate < 60 -> "Reposo"
                    heartRate < 100 -> "Normal"
                    heartRate < 140 -> "Cardio"
                    heartRate < 170 -> "Intenso"
                    else -> "Máximo"
                }
                val zoneColor = when {
                    heartRate == 0 -> TextDisabled
                    heartRate < 60 -> CyanPrimary
                    heartRate < 100 -> Success
                    heartRate < 140 -> Warning
                    heartRate < 170 -> StreakFire
                    else -> Error
                }
                Text(
                    text = zoneText,
                    color = zoneColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }
    }
}
