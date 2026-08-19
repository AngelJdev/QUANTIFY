package com.example.smarttv_quantify.ui.dashboard

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Layers
import androidx.compose.material.icons.filled.Leaderboard
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.automirrored.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
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
import com.example.smarttv_quantify.data.repository.QuantifyRepository
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.AnimatedBarChart
import com.example.smarttv_quantify.ui.components.CountUpText
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
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
fun DashboardScreen(
    userName: String?,
    serverUrl: String,
    onOpenHabit: (Long, String?) -> Unit,
    onOpenAchievements: () -> Unit,
    onOpenSettings: () -> Unit
) {
    val repository = remember(serverUrl) { QuantifyRepository(serverUrl) }
    val scope = rememberCoroutineScope()

    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var stats by remember { mutableStateOf(GlobalStatsData()) }
    var habits by remember { mutableStateOf<List<HabitDto>>(emptyList()) }
    var streak by remember { mutableStateOf(0) }
    var refreshKey by remember { mutableStateOf(0) }

    LaunchedEffect(repository, refreshKey) {
        loading = true
        error = null
        runCatching {
            val p = async { repository.getProfile() }
            val g = async { repository.getGlobalStats() }
            val h = async { repository.getHabits() }
            Triple(p.await(), g.await(), h.await())
        }.onSuccess { (profile, global, habitsEnv) ->
            stats = global.data ?: GlobalStatsData()
            habits = habitsEnv.data.orEmpty()
            streak = profile.data?.user?.current_streak ?: 0
            loading = false
        }.onFailure {
            error = it.message ?: "Error de conexión con el servidor"
            loading = false
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
                    .padding(40.dp),
                verticalArrangement = Arrangement.spacedBy(32.dp)
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
                                text = "BIENVENIDO, ${userName?.uppercase() ?: "EXPLORADOR"}",
                                color = QuantifyTextPrimary,
                                fontSize = 28.sp,
                                fontWeight = FontWeight.Black,
                                letterSpacing = 1.sp
                            )
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Icon(Icons.Default.LocalFireDepartment, "Racha", tint = Color(0xFFFF9F00), modifier = Modifier.size(18.dp))
                                Text(
                                    text = "RACHA ACTUAL: $streak DÍAS",
                                    color = QuantifyTextMuted,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    letterSpacing = 1.sp
                                )
                                Spacer(Modifier.width(10.dp))
                                Text(fechaHoy(), color = QuantifyTextMuted.copy(alpha = 0.6f), fontSize = 14.sp)
                            }
                        }
                    }

                    LiveClockDisplay()
                }

                Row(modifier = Modifier.weight(1f), horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                    // Panel Izquierdo: Estadísticas y Gráfico
                    Column(modifier = Modifier.weight(0.65f), verticalArrangement = Arrangement.spacedBy(24.dp)) {
                        Row(horizontalArrangement = Arrangement.spacedBy(20.dp), modifier = Modifier.fillMaxWidth()) {
                            StatCard(
                                title = "CUMPLIMIENTO",
                                icon = Icons.Default.CheckCircle,
                                modifier = Modifier.weight(1f),
                                accent = QuantifyCyan
                            ) {
                                Text("${stats.globalScore}%", color = QuantifyTextPrimary, fontSize = 34.sp, fontWeight = FontWeight.Black)
                            }
                            StatCard(
                                title = "COMPLETADOS",
                                icon = Icons.AutoMirrored.Filled.TrendingUp,
                                modifier = Modifier.weight(1f),
                                accent = QuantifySuccess
                            ) {
                                Text("${stats.dailyCompletion}", color = QuantifyTextPrimary, fontSize = 34.sp, fontWeight = FontWeight.Black)
                            }
                            StatCard(
                                title = "TOTAL HÁBITOS",
                                icon = Icons.Default.Leaderboard,
                                modifier = Modifier.weight(1f),
                                accent = QuantifyWarning
                            ) {
                                Text("${stats.totalHabits}", color = QuantifyTextPrimary, fontSize = 34.sp, fontWeight = FontWeight.Black)
                            }
                        }

                        FocusableCard(
                            onClick = {},
                            modifier = Modifier.weight(1f),
                            cornerRadius = 32.dp
                        ) {
                            Column(Modifier.padding(28.dp)) {
                                SectionTitle("RENDIMIENTO DIARIO", "PORCENTAJE DE CUMPLIMIENTO")
                                Spacer(Modifier.height(24.dp))
                                AnimatedBarChart(
                                    data = stats.dailyPerformance.map { it.porcentaje.toFloat() },
                                    modifier = Modifier.fillMaxSize()
                                )
                            }
                        }
                    }

                    // Panel Derecho: Hábitos y Acceso Rápido
                    Column(modifier = Modifier.weight(0.35f), verticalArrangement = Arrangement.spacedBy(24.dp)) {
                        FocusableCard(
                            onClick = onOpenAchievements,
                            cornerRadius = 28.dp,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(20.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(16.dp)
                            ) {
                                Icon(Icons.Default.EmojiEvents, null, tint = Color(0xFFFFD700), modifier = Modifier.size(30.dp))
                                Column {
                                    Text("LOGROS DESBLOQUEADOS", color = QuantifyTextPrimary, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                    Text("VER TU VITRINA DE TROFEOS", color = QuantifyTextMuted, fontSize = 12.sp)
                                }
                            }
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            SectionTitle("TUS HÁBITOS")
                            Spacer(Modifier.height(16.dp))
                            LazyRow(
                                contentPadding = PaddingValues(end = 20.dp),
                                horizontalArrangement = Arrangement.spacedBy(20.dp),
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                items(habits) { habit ->
                                    HabitCard(habit = habit, onClick = { onOpenHabit(habit.id, habit.nombre) })
                                }
                            }
                        }

                        NavButton(
                            label = "CONFIGURACIÓN",
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
private fun HabitCard(habit: HabitDto, onClick: () -> Unit) {
    FocusableCard(
        onClick = onClick,
        modifier = Modifier.width(280.dp),
        contentPadding = 24.dp
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
                    .background(QuantifyCyan.copy(alpha = 0.12f))
                    .border(1.dp, QuantifyCyan.copy(alpha = 0.4f), RoundedCornerShape(999.dp))
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
                            .background(QuantifyCyan)
                    )
                    Text(
                        text = "EN VIVO",
                        color = QuantifyCyan,
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
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CountUpText(
                target = 10,
                color = QuantifyTextPrimary,
                fontSize = 24.dp
            )
            Text("SESIONES", color = QuantifyTextMuted, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

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
