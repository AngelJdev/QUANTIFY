package com.quantify.smartwatch.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Button
import androidx.wear.compose.material.ButtonDefaults
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 5.2 — Unlink Warning
 * Danger zone: warns user that local data will be erased.
 * Compact layout optimized for round Wear OS displays.
 */
@Composable
fun UnlinkScreen(onConfirm: () -> Unit) {
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
            // Warning Icon Badge
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(colors.error.copy(alpha = 0.18f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "!",
                    color = colors.error,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "¿DESVINCULAR?",
                color = colors.error,
                fontSize = 12.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = "Se borrarán los datos locales",
                color = colors.textSecondary,
                fontSize = 9.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Button(
                onClick = onConfirm,
                colors = ButtonDefaults.buttonColors(backgroundColor = colors.error),
                modifier = Modifier
                    .height(30.dp)
                    .width(110.dp)
            ) {
                Text(
                    text = "CONTINUAR",
                    color = Color.White,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }
    }
}

