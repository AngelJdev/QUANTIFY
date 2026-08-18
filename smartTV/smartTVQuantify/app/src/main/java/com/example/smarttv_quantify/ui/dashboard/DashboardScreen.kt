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
import com.example.smarttv_quantify.ui.theme.QuantifyBorder
import com.example.smarttv_quantify.ui.theme.QuantifyCyan
import com.example.smarttv_quantify.ui.theme.QuantifySurface
import com.example.smarttv_quantify.ui.theme.QuantifySuccess
import com.example.smarttv_quantify.ui.theme.QuantifyTextMuted
import com.example.smarttv_quantify.ui.theme.QuantifyTextPrimary
import com.example.smarttv_quantify.ui.theme.QuantifyWarning
import kotlinx.coroutines.async
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
            streak = profile.data?.current_streak ?: 0
            loading = false
        }.onFailure {
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
                QuantifyLogo(subtitle = "SMART TV")
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                    NavButton("Logros", Icons.Filled.EmojiEvents, onOpenAchievements)
                    NavButton("Ajustes", Icons.Filled.Settings, onOpenSettings)
                }
            }

            // ===== Greeting =====
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                Text(
                    text = "Panel de control",
                    color = QuantifyCyan,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 4.sp
                )
                Text(
                    text = "Buenas métricas, ${userName ?: "usuario"}",
                    color = QuantifyTextPrimary,
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = (-1).sp
                )
                Text(
                    text = fechaHoy(),
                    color = QuantifyTextMuted,
                    fontSize = 17.sp
                )
            }

            when {
                loading -> LoadingDashboard()
                error != null -> ErrorPanel(message = error!!, onRetry = { refreshKey++ })
                else -> {
                    // ===== Stat cards =====
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        StatCard(
                            title = "Adherencia Global",
                            icon = Icons.AutoMirrored.Filled.TrendingUp,
                            modifier = Modifier.weight(1f)
                        ) {
                            CountUpText(target = stats.globalScore, fontSize = 44.dp, suffix = "")
                        }
                        StatCard(
                            title = "Racha Actual",
                            icon = Icons.Filled.LocalFireDepartment,
                            accent = QuantifyWarning,
                            modifier = Modifier.weight(1f)
                        ) {
                            CountUpText(target = streak, fontSize = 44.dp, suffix = "", color = QuantifyWarning)
                            Text("días", color = QuantifyTextMuted, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                        StatCard(
                            title = "Hábitos Activos",
                            icon = Icons.Filled.Layers,
                            accent = QuantifySuccess,
                            modifier = Modifier.weight(1f)
                        ) {
                            CountUpText(target = stats.totalHabits, fontSize = 44.dp, suffix = "", color = QuantifySuccess)
                            Text("total", color = QuantifyTextMuted, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                        }
                        StatCard(
                            title = "Cumplimiento Hoy",
                            icon = Icons.Filled.CheckCircle,
                            accent = QuantifyCyan,
                            modifier = Modifier.weight(1f)
                        ) {
                            CountUpText(target = stats.dailyCompletion, fontSize = 44.dp, suffix = "")
                        }
                    }

                    // ===== Chart card =====
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(20.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Column(
                            modifier = Modifier
                                .weight(2f)
                                .clip(RoundedCornerShape(28.dp))
                                .background(QuantifySurface)
                                .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
                                .padding(28.dp),
                            verticalArrangement = Arrangement.spacedBy(18.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                SectionTitle("Rendimiento", "30 días")
                                Box(
                                    Modifier
                                        .clip(RoundedCornerShape(999.dp))
                                        .background(QuantifyCyan.copy(alpha = 0.14f))
                                        .padding(horizontal = 16.dp, vertical = 8.dp)
                                ) {
                                    Text(
                                        "ADHERENCIA GLOBAL ${stats.globalScore}%",
                                        color = QuantifyCyan,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        letterSpacing = 1.5.sp
                                    )
                                }
                            }
                            AnimatedBarChart(
                                data = stats.dailyPerformance.map { it.porcentaje.toFloat() },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(220.dp)
                            )
                            Row(Modifier.fillMaxWidth()) {
                                val labels = stats.dailyPerformance.takeLast(7).map { p ->
                                    p.fecha?.takeLast(5) ?: ""
                                }
                                labels.forEach { l ->
                                    Text(
                                        text = l,
                                        color = QuantifyTextMuted,
                                        fontSize = 13.sp,
                                        fontWeight = FontWeight.Medium,
                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                        modifier = Modifier.weight(1f)
                                    )
                                }
                            }
                        }

                        // ===== Habits summary =====
                        Column(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(28.dp))
                                .background(QuantifySurface)
                                .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
                                .padding(28.dp),
                            verticalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            SectionTitle("Hábitos", "${habits.size} en tu plan")
                            habits.take(3).forEach { h ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        Modifier
                                            .width(6.dp)
                                            .height(34.dp)
                                            .clip(RoundedCornerShape(3.dp))
                                            .background(QuantifyCyan)
                                    )
                                    Column(Modifier.weight(1f)) {
                                        Text(
                                            text = h.nombre,
                                            color = QuantifyTextPrimary,
                                            fontSize = 19.sp,
                                            fontWeight = FontWeight.Bold,
                                            maxLines = 1,
                                            overflow = TextOverflow.Ellipsis
                                        )
                                        Text(
                                            text = h.tipo_medicion ?: "BOOLEANO",
                                            color = QuantifyTextMuted,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.Bold,
                                            letterSpacing = 1.sp
                                        )
                                    }
                                }
                            }
                            if (habits.isEmpty()) {
                                Text("Aún no tienes hábitos creados.", color = QuantifyTextMuted, fontSize = 17.sp)
                            }
                        }
                    }

                    // ===== Habits carousel =====
                    SectionTitle("Explora tus hábitos", "Selecciona para ver sus analíticas")
                    LazyRow(
                        contentPadding = PaddingValues(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(20.dp)
                    ) {
                        items(habits, key = { it.id }) { habit ->
                            HabitCard(habit) {
                                onOpenHabit(habit.id, habit.nombre)
                            }
                        }
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
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Text(
                    text = habit.tipo_medicion ?: "BOOLEANO",
                    color = QuantifyCyan,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
            }
            Icon(
                Icons.Filled.Leaderboard,
                contentDescription = null,
                tint = QuantifyTextMuted
            )
        }
        Spacer(Modifier.height(18.dp))
        Text(
            text = habit.nombre,
            color = QuantifyTextPrimary,
            fontSize = 24.sp,
            fontWeight = FontWeight.Black,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        Spacer(Modifier.height(8.dp))
        val meta = habit.meta_diaria?.let { "Meta: $it ${habit.unidad ?: ""}".trim() }
        Text(
            text = meta ?: (habit.descripcion ?: "Hábito sin meta definida"),
            color = QuantifyTextMuted,
            fontSize = 16.sp,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
private fun LoadingDashboard() {
    Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
        Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
            repeat(4) {
                Box(
                    Modifier
                        .weight(1f)
                        .height(150.dp)
                        .clip(RoundedCornerShape(28.dp))
                        .background(QuantifySurface)
                )
            }
        }
        Box(
            Modifier
                .fillMaxWidth()
                .height(360.dp)
                .clip(RoundedCornerShape(28.dp))
                .background(QuantifySurface)
        )
    }
}

private fun fechaHoy(): String {
    return try {
        SimpleDateFormat("EEEE, d 'de' MMMM yyyy", Locale.forLanguageTag("es-MX")).format(Date()).replaceFirstChar { it.titlecase(Locale.forLanguageTag("es-MX")) }
    } catch (e: Exception) {
        ""
    }
}
