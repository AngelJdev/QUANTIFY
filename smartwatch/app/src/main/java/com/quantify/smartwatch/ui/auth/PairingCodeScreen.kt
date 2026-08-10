package com.quantify.smartwatch.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 1.4 — Pairing Code Display
 * Shows the 6-char code the user must enter on the QUANTIFY web app.
 * Large monospace font for readability on the small watch screen.
 */
@Composable
fun PairingCodeScreen(
    code: String,
    onConfirm: () -> Unit,
    onRegenerate: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(BackgroundPrimary),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.padding(10.dp)
        ) {
            Text(
                text = "Código de vinculación",
                color = TextSecondary,
                fontSize = 11.sp,
                fontWeight = FontWeight.SemiBold,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(6.dp))

            // Large code display
            Box(
                modifier = Modifier
                    .border(1.5.dp, CyanPrimary, RoundedCornerShape(10.dp))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Text(
                    text = code,
                    color = CyanPrimary,
                    fontSize = 22.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 3.sp
                )
            }

            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Ingresa en la web",
                color = TextDisabled,
                fontSize = 9.sp
            )
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth(0.9f)
            ) {
                Chip(
                    onClick = onRegenerate,
                    colors = ChipDefaults.chipColors(backgroundColor = BackgroundElevated),
                    label = {
                        Text(
                            text = "↻",
                            fontSize = 16.sp,
                            color = TextSecondary,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )
                    },
                    modifier = Modifier.weight(0.35f)
                )
                Chip(
                    onClick = onConfirm,
                    colors = ChipDefaults.chipColors(backgroundColor = CyanPrimary),
                    label = {
                        Text(
                            text = "Continuar",
                            color = BackgroundPrimary,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.fillMaxWidth(),
                            textAlign = TextAlign.Center
                        )
                    },
                    modifier = Modifier.weight(0.65f)
                )
            }
        }
    }
}
