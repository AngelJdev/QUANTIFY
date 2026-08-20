package com.example.smarttv_quantify.ui.habit

import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
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
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
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
import com.example.smarttv_quantify.data.remote.isAuthenticationFailure
import com.example.smarttv_quantify.data.repository.QuantifyRepository
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.AnimatedLineChart
import com.example.smarttv_quantify.ui.components.CountUpText
import com.example.smarttv_quantify.ui.components.ErrorPanel
import com.example.smarttv_quantify.ui.components.FocusableCard
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
    onBack: () -> Unit,
    onSessionExpired: () -> Unit
) {
    val repository = remember(serverUrl) { QuantifyRepository(serverUrl) }

    BackHandler(onBack = onBack)

    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var adherence by remember { mutableStateOf(AdherenceData()) }
    var refreshKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(repository, habitId, refreshKey) {
        loading = true
        error = null
        runCatching { repository.getAdherence(habitId) }
            .onSuccess { env ->
                adherence = env.data ?: AdherenceData()
                loading = false
            }
            .onFailure {
                if (it.isAuthenticationFailure()) {
                    onSessionExpired()
                    return@onFailure
                }
                error = it.message ?: "Error de conexión"
                loading = false
            }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AmbientBackground()

        val scrollState = rememberScrollState()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 64.dp, vertical = 48.dp),
            verticalArrangement = Arrangement.spacedBy(28.dp)
        ) {
            // ===== Top bar =====
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                NavButton(
                    label = "Volver",
                    icon = Icons.AutoMirrored.Filled.ArrowBack,
                    onClick = onBack,
                    requestInitialFocus = true
                )
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

                        // ===== Stats + Chart + AI Video Recommendations =====
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
                                    .padding(24.dp),
                                verticalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                SectionTitle("Esfuerzo diario", "últimos 7 días")
                                AnimatedLineChart(
                                    data = adherence.chartData.map { it.valor.toFloat() },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(180.dp)
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

                            HabitGuidanceSection(adherence = adherence)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun HabitGuidanceSection(adherence: AdherenceData) {
    val (title, message) = when {
        adherence.isNewHabit -> "Construye una base" to
            "Este hábito todavía tiene poco historial. Completa tus días programados para obtener una lectura más precisa."
        adherence.adherenceScore >= 80 -> "Vas por muy buen camino" to
            "Tu constancia es alta. Mantén el mismo horario y protege la rutina que ya te está funcionando."
        adherence.tendenciaSemanal > 0 -> "Tu semana está mejorando" to
            "La tendencia subió ${adherence.tendenciaSemanal}%. Repite las condiciones de los días que sí cumpliste."
        adherence.adherenceScore >= 50 -> "Haz la meta más sencilla" to
            "Tienes una base estable. Reduce la dificultad en días ocupados para evitar romper la continuidad."
        else -> "Retoma con un paso pequeño" to
            "No necesitas recuperar todo en un día. Empieza con una versión corta del hábito y vuelve a sumar constancia."
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .background(QuantifySurface)
            .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Text(
            text = "SIGUIENTE PASO",
            color = QuantifyCyan,
            fontSize = 13.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 2.sp
        )
        Text(title, color = QuantifyTextPrimary, fontSize = 25.sp, fontWeight = FontWeight.Black)
        Text(message, color = QuantifyTextMuted, fontSize = 17.sp)
        Text(
            text = "Consejo calculado con tu adherencia y tendencia actuales.",
            color = QuantifyTextMuted.copy(alpha = 0.7f),
            fontSize = 13.sp
        )
    }
}

data class RecommendedVideo(
    val id: String,
    val title: String,
    val channel: String,
    val duration: String,
    val relevance: String,
    val description: String,
    val categoryBadge: String,
    val gradientColors: List<Color>
)

@Composable
fun AiVideoRecommendationsSection(habitName: String?) {
    var selectedVideo by remember { mutableStateOf<RecommendedVideo?>(null) }

    BackHandler(enabled = selectedVideo != null) {
        selectedVideo = null
    }

    val videos = remember(habitName) {
        val name = (habitName ?: "").lowercase()
        when {
            name.contains("medit") || name.contains("mente") || name.contains("relax") || name.contains("sueño") -> listOf(
                RecommendedVideo(
                    id = "1",
                    title = "Meditación Guiada de 10 Min para Calmar la Mente",
                    channel = "Mindful Life AI",
                    duration = "10:15",
                    relevance = "99% Coincidencia Bio-Rítmica",
                    description = "Una sesión diseñada por neurocientíficos para desacelerar las ondas cerebrales Beta a Alfa en menos de 5 minutos.",
                    categoryBadge = "MEDITACIÓN & MINDFULNESS 🧘‍♂️",
                    gradientColors = listOf(Color(0xFF0284C7), Color(0xFF0F172A))
                ),
                RecommendedVideo(
                    id = "2",
                    title = "Música Binaural Theta: Enfoque y Relajación Profunda",
                    channel = "Bio-Focus Soundlabs",
                    duration = "20:00",
                    relevance = "96% Relevancia",
                    description = "Frecuencia de 432Hz optimizada para reducir el cortisol y restaurar la atención plena.",
                    categoryBadge = "ONDAS BINAURALES 🧠",
                    gradientColors = listOf(Color(0xFF7C3AED), Color(0xFF0F172A))
                ),
                RecommendedVideo(
                    id = "3",
                    title = "Técnica de Respiración 4-7-8 contra el Estrés",
                    channel = "Wellness AI Labs",
                    duration = "08:30",
                    relevance = "94% Relevancia",
                    description = "Ejercicio respiratorio para activar el sistema parasimpático de forma instantánea.",
                    categoryBadge = "RESPIRACIÓN CONSCIENTE 🌬️",
                    gradientColors = listOf(Color(0xFF059669), Color(0xFF0F172A))
                )
            )
            name.contains("ejercici") || name.contains("gym") || name.contains("cardio") || name.contains("correr") || name.contains("fuerza") -> listOf(
                RecommendedVideo(
                    id = "1",
                    title = "Rutina HIIT Cardio de 15 Minutos Sin Equipo",
                    channel = "Quantify Fitness AI",
                    duration = "15:00",
                    relevance = "98% Coincidencia Bio-Rítmica",
                    description = "Circuito de alta intensidad para elevar el consumo máximo de oxígeno (VO2 Max) en casa.",
                    categoryBadge = "ENTRENAMIENTO HIIT 🏋️‍♂️",
                    gradientColors = listOf(Color(0xFFE11D48), Color(0xFF0F172A))
                ),
                RecommendedVideo(
                    id = "2",
                    title = "Estiramientos Dinámicos Post-Entrenamiento",
                    channel = "Bio-Movement Studio",
                    duration = "07:45",
                    relevance = "95% Relevancia",
                    description = "Movilidad articular para prevenir dolores musculares y acelerar la recuperación.",
                    categoryBadge = "RECUPERACIÓN & MOVILIDAD 🧘‍♀️",
                    gradientColors = listOf(Color(0xFFD97706), Color(0xFF0F172A))
                )
            )
            name.contains("estudi") || name.contains("lectur") || name.contains("leer") || name.contains("codig") || name.contains("focus") -> listOf(
                RecommendedVideo(
                    id = "1",
                    title = "Técnica Pomodoro 25/5 con Lo-Fi Beats & Lluvia",
                    channel = "Deep Focus Hub",
                    duration = "25:00",
                    relevance = "99% Coincidencia Bio-Rítmica",
                    description = "Sesión de estudio inmersivo con temporizador de alta productividad integrativo.",
                    categoryBadge = "DEEP WORK & ESTUDIO 📚",
                    gradientColors = listOf(Color(0xFF2563EB), Color(0xFF0F172A))
                ),
                RecommendedVideo(
                    id = "2",
                    title = "La Ciencia Neuroplástica de la Lectura Diaria",
                    channel = "NeuroScience AI",
                    duration = "12:20",
                    relevance = "93% Relevancia",
                    description = "Descubre cómo leer 15 minutos diarios transforma la densidad de sustancia gris cerebral.",
                    categoryBadge = "NEUROCIENCIA 🧠",
                    gradientColors = listOf(Color(0xFF9333EA), Color(0xFF0F172A))
                )
            )
            else -> listOf(
                RecommendedVideo(
                    id = "1",
                    title = "La Ciencia de Construir Hábitos Atómicos Sostenibles",
                    channel = "Quantify AI Academy",
                    duration = "14:10",
                    relevance = "97% Relevancia IA",
                    description = "Principios biológicos de la formación de surcos neuronales para automatizar metas.",
                    categoryBadge = "CRECIMIENTO PERSONAL ⚡",
                    gradientColors = listOf(Color(0xFF0D9488), Color(0xFF0F172A))
                ),
                RecommendedVideo(
                    id = "2",
                    title = "Dopamina & Alto Rendimiento: Optimiza tu Rutina",
                    channel = "Bio-Hacking Labs",
                    duration = "18:30",
                    relevance = "95% Relevancia IA",
                    description = "Cómo estructurar recompensas sanas para mantener rachas de hábitos sin agotamiento.",
                    categoryBadge = "OPTIMIZACIÓN DE BIENESTAR 🧪",
                    gradientColors = listOf(Color(0xFF4F46E5), Color(0xFF0F172A))
                )
            )
        }
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(28.dp))
            .background(QuantifySurface)
            .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
            .padding(24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            SectionTitle("Sugerencias de la IA", "Videos recomendados para este hábito")
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .background(QuantifyCyan.copy(alpha = 0.15f))
                    .border(1.dp, QuantifyCyan.copy(alpha = 0.4f), RoundedCornerShape(999.dp))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Text(
                    text = "RECOMENDADO POR QUANTIFY AI 🤖",
                    color = QuantifyCyan,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 1.sp
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            videos.forEach { video ->
                FocusableCard(
                    onClick = { selectedVideo = video },
                    modifier = Modifier.weight(1f),
                    cornerRadius = 20.dp,
                    contentPadding = 0.dp
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Brush.verticalGradient(video.gradientColors))
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Thumbnail Header con botón de Play
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(100.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color.Black.copy(alpha = 0.4f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("▶️", fontSize = 32.sp)
                            Box(
                                modifier = Modifier
                                    .align(Alignment.BottomEnd)
                                    .padding(6.dp)
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color.Black.copy(alpha = 0.8f))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = video.duration,
                                    color = Color.White,
                                    fontSize = 11.sp,
                                    fontFamily = Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Text(
                            text = video.categoryBadge,
                            color = QuantifyCyan,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            letterSpacing = 1.sp
                        )

                        Text(
                            text = video.title,
                            color = QuantifyTextPrimary,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        Text(
                            text = "${video.channel} • ${video.relevance}",
                            color = QuantifyTextMuted,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }

    // Modal de Vista Previa de Video Interactivo para Smart TV
    if (selectedVideo != null) {
        val v = selectedVideo!!
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.92f))
                .padding(48.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth(0.85f)
                    .clip(RoundedCornerShape(32.dp))
                    .background(QuantifySurface)
                    .border(2.dp, QuantifyCyan, RoundedCornerShape(32.dp))
                    .padding(36.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "REPRODUCCIÓN DEMO EN TV 📺",
                        color = QuantifyCyan,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 2.sp
                    )
                    NavButton(
                        label = "Cerrar",
                        icon = Icons.AutoMirrored.Filled.ArrowBack,
                        onClick = { selectedVideo = null },
                        requestInitialFocus = true
                    )
                }

                // Mock Video Player Display
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp)
                        .clip(RoundedCornerShape(20.dp))
                        .background(Brush.verticalGradient(v.gradientColors)),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Text("🎬 Reproduciendo en Smart TV...", color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Black)
                        Text(v.title, color = QuantifyCyan, fontSize = 18.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                        Text("Canal: ${v.channel} | Duración: ${v.duration}", color = QuantifyTextMuted, fontSize = 14.sp)
                    }
                }

                Text(
                    text = v.description,
                    color = QuantifyTextPrimary,
                    fontSize = 16.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 24.dp)
                )

                FocusableCard(
                    onClick = { selectedVideo = null },
                    cornerRadius = 999.dp,
                    contentPadding = 14.dp
                ) {
                    Text("VOLVER AL ANÁLISIS", color = QuantifyCyan, fontWeight = FontWeight.Bold, letterSpacing = 2.sp, modifier = Modifier.padding(horizontal = 20.dp))
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
