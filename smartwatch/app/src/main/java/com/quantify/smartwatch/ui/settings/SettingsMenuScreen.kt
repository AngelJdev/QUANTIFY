package com.quantify.smartwatch.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import com.quantify.smartwatch.ui.viewmodel.SettingsViewModel

/**
 * Screen 5.1 — Settings Menu
 * Account info, sync frequency, vibration toggle, unlink, about.
 * Clean, engineering-focused design without emojis.
 */
@Composable
fun SettingsMenuScreen(
    viewModel: SettingsViewModel,
    onUnlink: () -> Unit,
    onAbout: () -> Unit
) {
    val email by viewModel.userEmail.collectAsState()
    val syncInterval by viewModel.syncInterval.collectAsState()
    val vibration by viewModel.vibrationEnabled.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary)
    ) {
        ScalingLazyColumn(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            item {
                Text(
                    text = "AJUSTES",
                    color = CyanPrimary,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp,
                    modifier = Modifier.padding(bottom = 6.dp)
                )
            }

            // Account
            item {
                Chip(
                    onClick = {},
                    label = { Text("Cuenta", color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) },
                    secondaryLabel = {
                        Text(email ?: "No vinculado", color = TextSecondary, fontSize = 9.sp)
                    },
                    icon = {
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .background(CyanDark.copy(alpha = 0.3f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("ID", color = CyanPrimary, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                        }
                    },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }

            // Sync frequency
            item {
                Chip(
                    onClick = {
                        val next = when (syncInterval) {
                            15 -> 30
                            30 -> 60
                            else -> 15
                        }
                        viewModel.setSyncInterval(next)
                    },
                    label = { Text("Sincronización", color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) },
                    secondaryLabel = {
                        Text("Cada ${syncInterval} min", color = CyanPrimary, fontSize = 9.sp)
                    },
                    icon = {
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .background(CyanPrimary.copy(alpha = 0.2f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("SYNC", color = CyanPrimary, fontSize = 6.sp, fontWeight = FontWeight.Bold)
                        }
                    },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }

            // Theme Selector (Clásico, B&W, Girly 💖💖💖, Claro)
            item {
                val currentTheme by viewModel.currentTheme.collectAsState()
                val themeLabel = when (currentTheme) {
                    "BLACK_WHITE" -> "B&W ⚪"
                    "GIRLY" -> "Girly 💖💖💖"
                    "CLARO" -> "Claro ☀️"
                    else -> "Clásico 💎"
                }
                Chip(
                    onClick = { viewModel.cycleTheme() },
                    label = { Text("Tema", color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) },
                    secondaryLabel = {
                        Text(themeLabel, color = CyanPrimary, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    },
                    icon = {
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .background(CyanPrimary.copy(alpha = 0.2f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🎨", fontSize = 9.sp)
                        }
                    },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }

            // Vibration toggle
            item {
                Chip(
                    onClick = { viewModel.setVibration(!vibration) },
                    label = { Text("Vibración", color = TextPrimary, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) },
                    secondaryLabel = {
                        Text(
                            if (vibration) "Activada" else "Silenciado",
                            color = if (vibration) Success else TextDisabled,
                            fontSize = 9.sp
                        )
                    },
                    icon = {
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .background(if (vibration) Success.copy(alpha = 0.2f) else TextDisabled.copy(alpha = 0.2f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(if (vibration) "ON" else "OFF", color = if (vibration) Success else TextDisabled, fontSize = 7.sp, fontWeight = FontWeight.Bold)
                        }
                    },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }

            // Unlink
            item {
                Chip(
                    onClick = onUnlink,
                    label = { Text("Desvincular", color = Error, fontSize = 12.sp, fontWeight = FontWeight.SemiBold) },
                    secondaryLabel = { Text("Cerrar sesión", color = TextDisabled, fontSize = 9.sp) },
                    icon = {
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .background(Error.copy(alpha = 0.2f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("X", color = Error, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }

            // About
            item {
                Chip(
                    onClick = onAbout,
                    label = { Text("Acerca de", color = TextSecondary, fontSize = 12.sp) },
                    secondaryLabel = { Text("QUANTIFY v1.0", color = TextDisabled, fontSize = 9.sp) },
                    icon = {
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .background(BackgroundSurface, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("i", color = TextSecondary, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                        }
                    },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }
        }
    }
}

