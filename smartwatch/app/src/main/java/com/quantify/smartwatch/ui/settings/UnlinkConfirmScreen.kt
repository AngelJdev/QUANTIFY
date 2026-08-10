package com.quantify.smartwatch.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*
import com.quantify.smartwatch.ui.viewmodel.SettingsViewModel

/**
 * Screen 5.3 — Unlink Confirmation
 * Final yes/no before wiping all local data.
 */
@Composable
fun UnlinkConfirmScreen(
    viewModel: SettingsViewModel,
    onConfirmed: () -> Unit,
    onCancel: () -> Unit
) {
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
                text = "¿Estás seguro?",
                color = TextPrimary,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(16.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                // Cancel
                Button(
                    onClick = onCancel,
                    colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.size(52.dp)
                ) {
                    Text("No", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
                // Confirm
                Button(
                    onClick = { viewModel.unlinkDevice(onConfirmed) },
                    colors = ButtonDefaults.buttonColors(backgroundColor = Error),
                    modifier = Modifier.size(52.dp)
                ) {
                    Text("Sí", color = TextPrimary, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
