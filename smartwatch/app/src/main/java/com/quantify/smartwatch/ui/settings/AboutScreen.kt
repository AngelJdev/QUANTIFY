package com.quantify.smartwatch.ui.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.*

/**
 * Screen 5.4 — About
 * App version, credits.
 */
@Composable
fun AboutScreen() {
    val colors = LocalQuantifyColors.current

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(colors.background),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(
                text = "Q",
                color = colors.primary,
                fontSize = 36.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "QUANTIFY",
                color = colors.primary,
                fontSize = 12.sp,
                letterSpacing = 3.sp,
                fontWeight = FontWeight.Light
            )
            Text(
                text = "SMARTWATCH",
                color = colors.textSecondary,
                fontSize = 10.sp,
                letterSpacing = 2.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "v1.0.0",
                color = colors.textDisabled,
                fontSize = 11.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "Wear OS Companion\nEngineering Aesthetic",
                color = colors.textDisabled,
                fontSize = 9.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}
