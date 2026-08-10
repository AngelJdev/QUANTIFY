package com.quantify.smartwatch.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
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
import androidx.wear.compose.material.ToggleChip
import androidx.wear.compose.material.ToggleChipDefaults
import com.quantify.smartwatch.ui.theme.*
import com.quantify.smartwatch.ui.viewmodel.SettingsViewModel

/**
 * Screen 5.1 — Settings Menu
 * Account info, sync frequency, vibration toggle, unlink, about.
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
                    text = "Ajustes",
                    color = CyanPrimary,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(bottom = 4.dp)
                )
            }

            // Account
            item {
                Chip(
                    onClick = {},
                    label = { Text("Cuenta", color = TextPrimary, fontSize = 13.sp) },
                    secondaryLabel = {
                        Text(email ?: "No vinculado", color = TextSecondary, fontSize = 10.sp)
                    },
                    icon = { Text("👤", fontSize = 16.sp) },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
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
                    label = { Text("Frecuencia sync", color = TextPrimary, fontSize = 13.sp) },
                    secondaryLabel = {
                        Text("Cada ${syncInterval} min", color = CyanPrimary, fontSize = 10.sp)
                    },
                    icon = { Text("🔄", fontSize = 16.sp) },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
                )
            }

            // Vibration toggle
            item {
                ToggleChip(
                    checked = vibration,
                    onCheckedChange = { viewModel.setVibration(it) },
                    label = { Text("Vibración", color = TextPrimary, fontSize = 13.sp) },
                    toggleControl = {
                        ToggleChipDefaults.SwitchIcon(checked = vibration)
                    },
                    colors = ToggleChipDefaults.toggleChipColors(
                        checkedStartBackgroundColor = BackgroundElevated,
                        checkedEndBackgroundColor = BackgroundElevated,
                        uncheckedStartBackgroundColor = BackgroundElevated,
                        uncheckedEndBackgroundColor = BackgroundElevated
                    ),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
                )
            }

            // Unlink
            item {
                Chip(
                    onClick = onUnlink,
                    label = { Text("Desvincular", color = Error, fontSize = 13.sp) },
                    icon = { Text("⚠", fontSize = 16.sp) },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
                )
            }

            // About
            item {
                Chip(
                    onClick = onAbout,
                    label = { Text("Acerca de", color = TextSecondary, fontSize = 13.sp) },
                    icon = { Text("ℹ", fontSize = 16.sp) },
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.fillMaxWidth().padding(horizontal = 8.dp)
                )
            }
        }
    }
}
