package com.quantify.smartwatch.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 1.2 — Not Configured
 * Shown when the watch has no active session.
 * Single CTA button to start the pairing flow.
 */
@Composable
fun NotConfiguredScreen(onConfigure: () -> Unit) {
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
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "⚙",
                fontSize = 32.sp,
                color = colors.primary
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Dispositivo\nno configurado",
                color = colors.textPrimary,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(14.dp))
            Chip(
                onClick = onConfigure,
                colors = ChipDefaults.chipColors(backgroundColor = colors.primary),
                label = {
                    Text(
                        text = "Configurar",
                        color = colors.onPrimary,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.fillMaxWidth(),
                        textAlign = TextAlign.Center
                    )
                },
                modifier = Modifier.fillMaxWidth(0.85f)
            )
        }
    }
}
