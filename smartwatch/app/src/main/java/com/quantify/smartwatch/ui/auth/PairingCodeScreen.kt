package com.quantify.smartwatch.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
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
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 1.4 — Pairing Code Display
 * Shows the 6-character code the user must enter on the QUANTIFY web app.
 * Automatically detects confirmation from the web and advances to the dashboard.
 */
@Composable
fun PairingCodeScreen(
    code: String,
    onRegenerate: () -> Unit
) {
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
                text = "VINCULACIÓN WEB",
                color = colors.primary,
                fontSize = 10.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 1.sp
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Large code display
            Box(
                modifier = Modifier
                    .background(colors.card, RoundedCornerShape(10.dp))
                    .border(1.5.dp, colors.primary, RoundedCornerShape(10.dp))
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = code.ifEmpty { "------" },
                    color = colors.textPrimary,
                    fontSize = 24.sp,
                    fontWeight = FontWeight.ExtraBold,
                    fontFamily = FontFamily.Monospace,
                    letterSpacing = 4.sp
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Waiting in web animated indicator
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                CircularProgressIndicator(
                    modifier = Modifier.size(10.dp),
                    indicatorColor = colors.primary,
                    trackColor = colors.ringBg,
                    strokeWidth = 2.dp
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Esperando en la web...",
                    color = colors.textSecondary,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Regenerate button
            Button(
                onClick = onRegenerate,
                colors = ButtonDefaults.buttonColors(backgroundColor = colors.card),
                modifier = Modifier
                    .height(28.dp)
                    .width(110.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Text("↻", color = colors.primary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("NUEVO CÓDIGO", color = colors.textSecondary, fontSize = 8.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

