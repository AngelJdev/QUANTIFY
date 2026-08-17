package com.quantify.smartwatch.ui.habits

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
 * Screen 3.4 — Day Complete
 * Shown when ALL habits for today are marked as completed.
 * Compact layout optimized for round Wear OS displays.
 */
@Composable
fun DayCompleteScreen(onContinue: () -> Unit) {
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
            modifier = Modifier.padding(horizontal = 12.dp)
        ) {
            // Circular 100% Badge
            Box(
                modifier = Modifier.size(42.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    progress = 1f,
                    modifier = Modifier.fillMaxSize(),
                    startAngle = 270f,
                    endAngle = 270f + 360f,
                    indicatorColor = colors.success,
                    trackColor = colors.card,
                    strokeWidth = 3.5.dp
                )

                Box(
                    modifier = Modifier
                        .size(30.dp)
                        .background(colors.success.copy(alpha = 0.15f), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "100%",
                        color = colors.success,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.ExtraBold
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "DÍA COMPLETADO",
                color = colors.success,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(2.dp))

            Text(
                text = "Hábitos de hoy cumplidos",
                color = colors.textSecondary,
                fontSize = 9.sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            // Continuar Button (Prominent, unclipped)
            Button(
                onClick = onContinue,
                colors = ButtonDefaults.buttonColors(backgroundColor = colors.primary),
                modifier = Modifier
                    .height(30.dp)
                    .width(110.dp)
            ) {
                Text(
                    text = "CONTINUAR",
                    color = colors.onPrimary,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.ExtraBold
                )
            }
        }
    }
}


