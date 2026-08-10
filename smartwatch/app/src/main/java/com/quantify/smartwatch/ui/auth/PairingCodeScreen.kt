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
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
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
            modifier = Modifier.padding(12.dp)
        ) {
            Text(
                text = "Ingresa este código\nen tu cuenta web",
                color = TextSecondary,
                fontSize = 11.sp,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(10.dp))

            // Large code display
            Box(
                modifier = Modifier
                    .border(1.dp, CyanPrimary, RoundedCornerShape(8.dp))
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(
                    text = code,
                    color = CyanPrimary,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 4.sp
                )
            }

            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "quantify.com/vincular",
                color = TextDisabled,
                fontSize = 9.sp
            )
            Spacer(modifier = Modifier.height(10.dp))

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = onRegenerate,
                    colors = ButtonDefaults.buttonColors(backgroundColor = BackgroundElevated),
                    modifier = Modifier.size(40.dp)
                ) {
                    Text("↻", fontSize = 16.sp, color = TextSecondary)
                }
                Button(
                    onClick = onConfirm,
                    colors = ButtonDefaults.buttonColors(backgroundColor = CyanPrimary),
                    modifier = Modifier.height(40.dp)
                ) {
                    Text("Listo", color = BackgroundPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
