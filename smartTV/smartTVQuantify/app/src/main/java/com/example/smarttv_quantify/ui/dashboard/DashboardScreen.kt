package com.example.smarttv_quantify.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarttv_quantify.data.remote.dto.GlobalStatsData
import com.example.smarttv_quantify.data.remote.dto.HabitDto
import com.example.smarttv_quantify.data.remote.isAuthenticationFailure
import com.example.smarttv_quantify.data.repository.QuantifyRepository
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.AnimatedBarChart
import com.example.smarttv_quantify.ui.components.ChartLabels
import com.example.smarttv_quantify.ui.components.ErrorPanel
import com.example.smarttv_quantify.ui.components.FocusableCard
import com.example.smarttv_quantify.ui.components.NavButton
import com.example.smarttv_quantify.ui.components.QuantifyLogo
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
import kotlinx.coroutines.async
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun DashboardScreen(
    userName: String?,
    serverUrl: String,
    onOpenHabit: (Long, String?) -> Unit,
    onOpenAchievements: () -> Unit,
    onOpenSettings: () -> Unit,
    onSessionExpired: () -> Unit
) {
    val repository = remember(serverUrl) { QuantifyRepository(serverUrl) }

    var loading by remember { mutableStateOf(true) }
    var hasLoaded by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf<String?>(null) }
    var stats by remember { mutableStateOf(GlobalStatsData()) }
    var habits by remember { mutableStateOf<List<HabitDto>>(emptyList()) }
    var streak by remember { mutableIntStateOf(0) }
    var refreshKey by remember { mutableIntStateOf(0) }
    var connected by remember { mutableStateOf(false) }
    var lastSync by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(repository, refreshKey) {
        while (isActive) {
            if (!hasLoaded) {
                loading = true
                error = null
            }
            runCatching {
                val p = async { repository.getProfile() }
                val g = async { repository.getGlobalStats() }
                val h = async { repository.getHabits() }
                Triple(p.await(), g.await(), h.await())
            }.onSuccess { (profile, global, habitsEnv) ->
                stats = global.data ?: GlobalStatsData()
                habits = habitsEnv.data.orEmpty().filter { it.activo }
                streak = profile.data?.user?.current_streak ?: 0
                connected = true
                lastSync = horaActual()
                error = null
                hasLoaded = true
                loading = false
            }.onFailure {
                if (it.isAuthenticationFailure()) {
                    onSessionExpired()
                    return@onFailure
                }
                connected = false
                if (!hasLoaded) {
                    error = it.message ?: "Error de conexión con el servidor"
                    loading = false
                }
            }
            delay(30_000)
        }
    }

    Box(Modifier.fillMaxSize()) {
        AmbientBackground(Modifier.fillMaxSize())

        if (loading) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    QuantifyLogo(modifier = Modifier.size(100.dp))
                    Spacer(Modifier.height(20.dp))
                    Text("CARGANDO TU UNIVERSO DE DATOS...", color = QuantifyCyan, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                }
            }
        } else if (error != null) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                ErrorPanel(
                    message = error!!,
                    onRetry = { refreshKey++ }
                )
            }
        } else {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 40.dp, vertical = 28.dp),
                verticalArrangement = Arrangement.spacedBy(22.dp)
            ) {
                // Header: Perfil y Reloj
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                        Box(
                            modifier = Modifier
                                .size(70.dp)
                                .clip(RoundedCornerShape(20.dp))
                                .background(QuantifyCyan.copy(alpha = 0.15f))
                                .border(2.dp, QuantifyCyan, RoundedCornerShape(20.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Layers, contentDescription = null, tint = QuantifyCyan, modifier = Modifier.size(35.dp))
                        }
                        Column {
                            Text(
                                text = "Hola, ${userName ?: "bienvenido"}",
                                color = QuantifyTextPrimary,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Black,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                                ConnectionBadge(connected = connected, lastSync = lastSync)
                                Spacer(Modifier.width(10.dp))
                                Text(fechaHoy(), color = QuantifyTextMuted.copy(alpha = 0.6f), fontSize = 14.sp)
                            }
                        }
                    }

                    LiveClockDisplay()
                }

                Row(modifier = Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(24.dp)) {
                    // Panel Izquierdo: Estadísticas y Gráfico
                    Column(modifier = Modifier.weight(0.65f), verticalArrangement = Arrangement.spacedBy(18.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(20.dp), modifier = Modifier.fillMaxWidth()) {
                            StatCard(
                                title = "RACHA",
                                modifier = Modifier.weight(1f),
                                accent = Color(0xFFFF9F00)
                            ) {
                                Text("$streak", color = QuantifyTextPrimary, fontSize = 32.sp, fontWeight = FontWeight.Black)
                                Text("días", color = QuantifyTextMuted, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            }
                            StatCard(
                                title = "ADHERENCIA",
                                modifier = Modifier.weight(1f),
                                accent = QuantifyCyan
                            ) {
                                Text("${stats.globalScore}%", color = QuantifyTextPrimary, fontSize = 32.sp, fontWeight = FontWeight.Black)
                            }
                            StatCard(
                                title = "HÁBITOS",
                                modifier = Modifier.weight(1f),
                                accent = QuantifyWarning
                            ) {
                                Text("${stats.totalHabits}", color = QuantifyTextPrimary, fontSize = 32.sp, fontWeight = FontWeight.Black)
                            }
                            StatCard(
                                title = "HOY",
                                modifier = Modifier.weight(1f),
                                accent = QuantifySuccess
                            ) {
                                Text("${stats.dailyCompletion}%", color = QuantifyTextPrimary, fontSize = 32.sp, fontWeight = FontWeight.Black)
                            }
                        }

                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(32.dp))
                                .background(QuantifySurface)
                                .border(1.dp, QuantifyBorder, RoundedCornerShape(32.dp))
                                .padding(28.dp)
                        ) {
                            val weeklyData = stats.dailyPerformance.takeLast(7)
                            SectionTitle("Tu semana", "Cumplimiento diario de los últimos 7 días")
                            Spacer(Modifier.height(14.dp))
                            if (weeklyData.isEmpty()) {
                                Box(Modifier.weight(1f).fillMaxWidth(), contentAlignment = Alignment.Center) {
                                    Text(
                                        "Aún no hay registros esta semana.",
                                        color = QuantifyTextMuted,
                                        fontSize = 17.sp
                                    )
                                }
                            } else {
                                Box(Modifier.weight(1f)) {
                                    AnimatedBarChart(
                                        data = weeklyData.map { it.porcentaje.toFloat() },
                                        modifier = Modifier.fillMaxSize()
                                    )
                                }
                                Spacer(Modifier.height(10.dp))
                                ChartLabels(
                                    labels = weeklyData.map { etiquetaDia(it.fecha) },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(22.dp)
                                )
                            }
                        }
                    }

                    // Panel Derecho: Hábitos y Acceso Rápido
                    Column(modifier = Modifier.weight(0.35f), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                        FocusableCard(
                            onClick = onOpenAchievements,
                            cornerRadius = 28.dp,
                            modifier = Modifier.fillMaxWidth(),
                            requestInitialFocus = habits.isEmpty(),
                            showSelectionBadge = false
                        ) {
                            Row(
                                modifier = Modifier.padding(20.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Icon(Icons.Default.EmojiEvents, null, tint = Color(0xFFFFD700), modifier = Modifier.size(30.dp))
                                Column {
                                    Text("TUS LOGROS", color = QuantifyTextPrimary, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                                    Text("REVISA AVANCES Y PRÓXIMOS OBJETIVOS", color = QuantifyTextMuted, fontSize = 12.sp)
                                }
                            }
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            SectionTitle("Tus hábitos", "Pulsa OK para ver el detalle")
                            Spacer(Modifier.height(12.dp))
                            LazyRow(
                                contentPadding = PaddingValues(end = 20.dp),
                                horizontalArrangement = Arrangement.spacedBy(20.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                if (habits.isEmpty()) {
                                    item {
                                        Text(
                                            text = "No hay hábitos activos.",
                                            color = QuantifyTextMuted,
                                            fontSize = 16.sp,
                                            maxLines = 1,
                                            modifier = Modifier.width(300.dp)
                                        )
                                    }
                                } else {
                                    itemsIndexed(habits, key = { _, habit -> habit.id }) { index, habit ->
                                        HabitCard(
                                            habit = habit,
                                            requestInitialFocus = index == 0,
                                            onClick = { onOpenHabit(habit.id, habit.nombre) }
                                        )
                                    }
                                }
                            }
                        }

                        NavButton(
                            label = "AJUSTES Y CONEXIÓN",
                            icon = Icons.Default.Settings,
                            onClick = onOpenSettings,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun HabitCard(habit: HabitDto, requestInitialFocus: Boolean, onClick: () -> Unit) {
    val statusColor = if (habit.completado_hoy) QuantifySuccess else QuantifyWarning
    val statusLabel = if (habit.completado_hoy) "COMPLETADO" else "PENDIENTE"
    FocusableCard(
        onClick = onClick,
        modifier = Modifier.width(280.dp),
        contentPadding = 24.dp,
        requestInitialFocus = requestInitialFocus,
        showSelectionBadge = false
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .background(QuantifyCyan.copy(alpha = 0.14f))
                    .padding(8.dp)
            ) {
                Icon(Icons.Default.Layers, null, tint = QuantifyCyan, modifier = Modifier.size(20.dp))
            }
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(999.dp))
                    .background(statusColor.copy(alpha = 0.12f))
                    .border(1.dp, statusColor.copy(alpha = 0.4f), RoundedCornerShape(999.dp))
                    .padding(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(10.dp)
                            .clip(RoundedCornerShape(5.dp))
                            .background(statusColor)
                    )
                    Text(
                        text = statusLabel,
                        color = statusColor,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 2.sp
                    )
                }
            }
        }
        Spacer(Modifier.height(20.dp))
        Text(
            text = habit.nombre.uppercase(),
            color = QuantifyTextPrimary,
            fontSize = 20.sp,
            fontWeight = FontWeight.Black,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
        Text(
            text = (habit.tipo_medicion ?: "Hábito").uppercase(),
            color = QuantifyCyan,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
        Spacer(Modifier.height(16.dp))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = habitGoal(habit),
                color = QuantifyTextPrimary,
                fontSize = 18.sp,
                fontWeight = FontWeight.Black,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = (habit.frecuencia ?: "DIARIO").uppercase(),
                color = QuantifyTextMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(Modifier.height(10.dp))
        Text(
            text = "VER DETALLE  ›",
            color = QuantifyCyan,
            fontSize = 13.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.2.sp
        )
    }
}

@Composable
private fun ConnectionBadge(connected: Boolean, lastSync: String?) {
    val color = if (connected) QuantifySuccess else QuantifyWarning
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(999.dp))
            .background(color.copy(alpha = 0.12f))
            .border(1.dp, color.copy(alpha = 0.45f), RoundedCornerShape(999.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(7.dp)
    ) {
        Box(Modifier.size(8.dp).clip(RoundedCornerShape(4.dp)).background(color))
        Text(
            text = if (connected) "EN LÍNEA · ${lastSync ?: "AHORA"}" else "RECONECTANDO",
            color = color,
            fontSize = 11.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 1.sp
        )
    }
}

private fun habitGoal(habit: HabitDto): String {
    val goal = habit.meta_diaria ?: return "META ABIERTA"
    val formatted = if (goal % 1.0 == 0.0) goal.toInt().toString() else "%.1f".format(goal)
    return listOfNotNull(formatted, habit.unidad?.takeIf { it.isNotBlank() }).joinToString(" ")
}

private fun etiquetaDia(date: String?): String {
    if (date.isNullOrBlank()) return "—"
    return runCatching {
        val parser = SimpleDateFormat("yyyy-MM-dd", Locale.US)
        val formatter = SimpleDateFormat("EEE", Locale.forLanguageTag("es-MX"))
        formatter.format(parser.parse(date) ?: return@runCatching date.takeLast(5)).uppercase()
    }.getOrDefault(date.takeLast(5))
}

private fun horaActual(): String =
    SimpleDateFormat("HH:mm:ss", Locale.getDefault()).format(Date())

private fun fechaHoy(): String {
    return try {
        SimpleDateFormat("EEEE, d 'de' MMMM yyyy", Locale.forLanguageTag("es-MX")).format(Date()).replaceFirstChar { it.titlecase(Locale.forLanguageTag("es-MX")) }
    } catch (e: Exception) {
        ""
    }
}

@Composable
private fun LiveClockDisplay() {
    var timeString by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        val sdf = SimpleDateFormat("hh:mm:ss a", Locale.US)
        while (isActive) {
            timeString = sdf.format(Date())
            delay(1000)
        }
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(20.dp))
            .background(QuantifySurface)
            .border(1.dp, QuantifyBorder, RoundedCornerShape(20.dp))
            .padding(horizontal = 20.dp, vertical = 12.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = timeString.ifEmpty { "--:--:-- --" },
            color = QuantifyCyan,
            fontSize = 28.sp,
            fontWeight = FontWeight.Black,
            fontFamily = Monospace,
            letterSpacing = 2.sp
        )
    }
}
