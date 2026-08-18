package com.example.smarttv_quantify.ui.habit

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.automirrored.filled.TrendingDown
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarttv_quantify.data.remote.dto.AdherenceData
import com.example.smarttv_quantify.data.repository.QuantifyRepository
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.AnimatedLineChart
import com.example.smarttv_quantify.ui.components.CountUpText
import com.example.smarttv_quantify.ui.components.ErrorPanel
import com.example.smarttv_quantify.ui.components.NavButton
import com.example.smarttv_quantify.ui.components.QuantifyLogo
import com.example.smarttv_quantify.ui.components.RadialGauge
import com.example.smarttv_quantify.ui.components.SectionTitle
import com.example.smarttv_quantify.ui.components.StatCard
import com.example.smarttv_quantify.ui.theme.Monospace
import com.example.smarttv_quantify.ui.theme.QuantifyBorder
import com.example.smarttv_quantify.ui.theme.QuantifyCyan
import com.example.smarttv_quantify.ui.theme.QuantifySurface
import com.example.smarttv_quantify.ui.theme.QuantifySuccess
import com.example.smarttv_quantify.ui.theme.QuantifyTextMuted
import com.example.smarttv_quantify.ui.theme.QuantifyTextPrimary
import com.example.smarttv_quantify.ui.theme.QuantifyWarning

@Composable
fun HabitDetailScreen(
    habitId: Long,
    habitName: String?,
    serverUrl: String,
    onBack: () -> Unit
) {
    val repository = remember(serverUrl) { QuantifyRepository(serverUrl) }

    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var adherence by remember { mutableStateOf(AdherenceData()) }
    var refreshKey by remember { mutableStateOf(0) }

    LaunchedEffect(repository, habitId, refreshKey) {
        loading = true
        error = null
        runCatching { repository.getAdherence(habitId) }
            .onSuccess { env ->
                adherence = env.data ?: AdherenceData()
                loading = false
            }
            .onFailure {
                error = it.message ?: "Error de conexión"
                loading = false
            }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AmbientBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 64.dp, vertical = 48.dp),
            verticalArrangement = Arrangement.spacedBy(28.dp)
        ) {
            // ===== Top bar =====
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                NavButton("Volver", Icons.AutoMirrored.Filled.ArrowBack, onBack)
                QuantifyLogo(subtitle = "DETALLE")
            }

            // ===== Header =====
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "ANÁLISIS DE HÁBITO",
                    color = QuantifyCyan,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 4.sp
                )
                Text(
                    text = habitName ?: "Hábito",
                    color = QuantifyTextPrimary,
                    fontSize = 44.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = (-1).sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            when {
                loading -> Box(Modifier.weight(1f)) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(24.dp), modifier = Modifier.align(Alignment.Center)) {
                        Box(Modifier.size(220.dp).clip(RoundedCornerShape(110.dp)).background(QuantifySurface))
                        Box(Modifier.fillMaxWidth().height(260.dp).clip(RoundedCornerShape(28.dp)).background(QuantifySurface))
                    }
                }
                error != null -> ErrorPanel(message = error!!, onRetry = { refreshKey++ })
                else -> {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(20.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        // ===== Gauge =====
                        Column(
                            modifier = Modifier
                                .weight(1.2f)
                                .clip(RoundedCornerShape(28.dp))
                                .background(QuantifySurface)
                                .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
                                .padding(28.dp),
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            SectionTitle("Adherencia", "últimos 30 días")
                            Box(contentAlignment = Alignment.Center) {
                                RadialGauge(
                                    value = adherence.adherenceScore.toFloat(),
                                    modifier = Modifier.size(280.dp),
                                    color = gaugeColor(adherence.adherenceScore)
                                )
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    CountUpText(
                                        target = adherence.adherenceScore,
                                        fontSize = 62.dp,
                                        color = gaugeColor(adherence.adherenceScore)
                                    )
                                    Text("de 100", color = QuantifyTextMuted, fontSize = 15.sp)
                                }
                            }
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                val up = adherence.tendenciaSemanal >= 0
                                Icon(
                                    if (up) Icons.AutoMirrored.Filled.TrendingUp else Icons.AutoMirrored.Filled.TrendingDown,
                                    contentDescription = null,
                                    tint = if (up) QuantifySuccess else Color(0xFFEF4444),
                                    modifier = Modifier.size(26.dp)
                                )
                                Text(
                                    text = "${if (up) "+" else ""}${adherence.tendenciaSemanal}% vs semana pasada",
                                    color = if (up) QuantifySuccess else Color(0xFFEF4444),
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                            if (adherence.isNewHabit) {
                                Text(
                                    text = "Hábito nuevo: se está construyendo tu historial",
                                    color = QuantifyWarning,
                                    fontSize = 15.sp,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }

                        // ===== Stats + Chart =====
                        Column(
                            modifier = Modifier.weight(2f),
                            verticalArrangement = Arrangement.spacedBy(20.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(20.dp)
                            ) {
                                StatCard(
                                    title = "Días cumplidos",
                                    icon = Icons.Filled.CheckCircle,
                                    accent = QuantifySuccess,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    CountUpText(target = adherence.diasCumplidos, fontSize = 44.dp, color = QuantifySuccess)
                                    Text("días", color = QuantifyTextMuted, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                                }
                                StatCard(
                                    title = "Días programados",
                                    icon = Icons.Filled.Psychology,
                                    accent = QuantifyCyan,
                                    modifier = Modifier.weight(1f)
                                ) {
                                    CountUpText(target = adherence.diasProgramados, fontSize = 44.dp)
                                    Text("días", color = QuantifyTextMuted, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(28.dp))
                                    .background(QuantifySurface)
                                    .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
                                    .padding(28.dp),
                                verticalArrangement = Arrangement.spacedBy(18.dp)
                            ) {
                                SectionTitle("Esfuerzo diario", "últimos 7 días")
                                AnimatedLineChart(
                                    data = adherence.chartData.map { it.valor.toFloat() },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(230.dp)
                                )
                                Row(Modifier.fillMaxWidth()) {
                                    adherence.chartData.forEach { p ->
                                        Text(
                                            text = p.fecha?.substring(5) ?: "",
                                            color = QuantifyTextMuted,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Medium,
                                            textAlign = TextAlign.Center,
                                            modifier = Modifier.weight(1f)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

private fun gaugeColor(score: Int): Color = when {
    score >= 80 -> QuantifySuccess
    score >= 50 -> QuantifyWarning
    else -> Color(0xFFEF4444)
}
