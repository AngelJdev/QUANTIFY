package com.quantify.smartwatch.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.Text
import com.quantify.smartwatch.ui.theme.StreakFire

/**
 * StreakBadge — Reusable fire icon + streak count.
 * Used in Watchface (2.1) and StreakStats (4.3).
 */
@Composable
fun StreakBadge(
    streak: Int,
    modifier: Modifier = Modifier,
    fontSize: Int = 13
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        modifier = modifier
    ) {
        Text(text = "🔥", fontSize = fontSize.sp)
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = "$streak",
            color = StreakFire,
            fontSize = fontSize.sp,
            fontWeight = FontWeight.Bold
        )
    }
}
