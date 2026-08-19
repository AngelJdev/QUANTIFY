package com.example.smarttv_quantify.ui.achievements

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Star
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
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarttv_quantify.data.remote.dto.AchievementDto
import com.example.smarttv_quantify.data.repository.QuantifyRepository
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.CountUpText
import com.example.smarttv_quantify.ui.components.ErrorPanel
import com.example.smarttv_quantify.ui.components.FocusableCard
import com.example.smarttv_quantify.ui.components.NavButton
import com.example.smarttv_quantify.ui.components.QuantifyLogo
import com.example.smarttv_quantify.ui.components.SectionTitle
import com.example.smarttv_quantify.ui.theme.QuantifyBorder
import com.example.smarttv_quantify.ui.theme.QuantifyCyan
import com.example.smarttv_quantify.ui.theme.QuantifySurface
import com.example.smarttv_quantify.ui.theme.QuantifySuccess
import com.example.smarttv_quantify.ui.theme.QuantifyTextMuted
import com.example.smarttv_quantify.ui.theme.QuantifyTextPrimary
import com.example.smarttv_quantify.ui.theme.QuantifyWarning

@Composable
fun AchievementsScreen(
    serverUrl: String,
    onBack: () -> Unit
) {
    val repository = remember(serverUrl) { QuantifyRepository(serverUrl) }

    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var achievements by remember { mutableStateOf<List<AchievementDto>>(emptyList()) }
    var total by remember { mutableStateOf(0) }
    var refreshKey by remember { mutableStateOf(0) }

    LaunchedEffect(repository, refreshKey) {
        loading = true
        error = null
        runCatching { repository.getAchievements() }
            .onSuccess { env ->
                achievements = env.data?.achievements ?: emptyList()
                total = env.data?.unlockedCount ?: achievements.size
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
                QuantifyLogo(subtitle = "LOGROS")
            }

            // ===== Header =====
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "COFRES DE HUELLA",
                        color = QuantifyCyan,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 4.sp
                    )
                    Text(
                        text = "Logros desbloqueados",
                        color = QuantifyTextPrimary,
                        fontSize = 40.sp,
                        fontWeight = FontWeight.Black,
                        letterSpacing = (-1).sp
                    )
                }
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("TOTAL", color = QuantifyTextMuted, fontSize = 15.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                    Box(
                        Modifier
                            .clip(RoundedCornerShape(999.dp))
                            .background(QuantifyCyan.copy(alpha = 0.14f))
                            .padding(horizontal = 20.dp, vertical = 8.dp)
                    ) {
                        CountUpText(target = total, fontSize = 26.dp, color = QuantifyCyan)
                    }
                }
            }

            when {
                loading -> Box(Modifier.weight(1f).fillMaxWidth()) {
                    Column(verticalArrangement = Arrangement.spacedBy(20.dp), modifier = Modifier.fillMaxWidth().align(Alignment.Center)) {
                        repeat(3) {
                            Box(Modifier.fillMaxWidth().height(150.dp).clip(RoundedCornerShape(28.dp)).background(QuantifySurface))
                        }
                    }
                }
                error != null -> ErrorPanel(message = error!!, onRetry = { refreshKey++ })
                achievements.isEmpty() -> Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Icon(Icons.Filled.Star, contentDescription = null, tint = QuantifyTextMuted, modifier = Modifier.scale(2.2f))
                    Text("Aún no has desbloqueado logros.", color = QuantifyTextMuted, fontSize = 20.sp)
                    Text("Sigue registrando tus hábitos y verás aparecer tus cofres aquí.", color = QuantifyTextMuted, fontSize = 16.sp, textAlign = TextAlign.Center)
                }
                else -> LazyVerticalGrid(
                    columns = GridCells.Fixed(3),
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(4.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp),
                    horizontalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    items(achievements, key = { it.id ?: it.titulo.orEmpty() }) { a ->
                        AchievementCard(a)
                    }
                }
            }
        }
    }
}

@Composable
private fun AchievementCard(achievement: AchievementDto) {
    val accent = accentFor(achievement.id)
    FocusableCard(
        onClick = {},
        contentPadding = 0.dp
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    Modifier
                        .clip(RoundedCornerShape(999.dp))
                        .background(accent.copy(alpha = 0.16f))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = achievement.mes_logro ?: "Desbloqueado",
                        color = accent,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }
                Icon(Icons.Filled.Star, contentDescription = null, tint = accent, modifier = Modifier.scale(1.4f))
            }
            Text(
                text = achievement.titulo ?: "Logro",
                color = QuantifyTextPrimary,
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = achievement.descripcion ?: "",
                color = QuantifyTextMuted,
                fontSize = 16.sp,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(Modifier.height(2.dp))
            Box(
                Modifier
                    .fillMaxWidth()
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp))
                    .background(accent)
            )
        }
    }
}

private fun accentFor(id: Int?): Color = when ((id ?: 1) % 3) {
    0 -> QuantifyCyan
    1 -> QuantifyWarning
    else -> QuantifySuccess
}
