package com.example.smarttv_quantify.ui.achievements

import androidx.activity.compose.BackHandler
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
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarttv_quantify.data.remote.dto.CatalogAchievementDto
import com.example.smarttv_quantify.data.remote.isAuthenticationFailure
import com.example.smarttv_quantify.data.repository.QuantifyRepository
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.CountUpText
import com.example.smarttv_quantify.ui.components.ErrorPanel
import com.example.smarttv_quantify.ui.components.FocusableCard
import com.example.smarttv_quantify.ui.components.NavButton
import com.example.smarttv_quantify.ui.components.QuantifyLogo
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
    onBack: () -> Unit,
    onSessionExpired: () -> Unit
) {
    val repository = remember(serverUrl) { QuantifyRepository(serverUrl) }

    var loading by remember { mutableStateOf(true) }
    var error by remember { mutableStateOf<String?>(null) }
    var achievements by remember { mutableStateOf<List<CatalogAchievementDto>>(emptyList()) }
    var selectedAchievement by remember { mutableStateOf<CatalogAchievementDto?>(null) }
    var unlockedCount by remember { mutableIntStateOf(0) }
    var total by remember { mutableIntStateOf(0) }
    var refreshKey by remember { mutableIntStateOf(0) }

    LaunchedEffect(repository, refreshKey) {
        loading = true
        error = null
        runCatching { repository.getAchievements() }
            .onSuccess { env ->
                val data = env.data
                achievements = data?.catalog.orEmpty()
                unlockedCount = data?.unlockedCount ?: achievements.count { it.unlocked }
                total = data?.totalCatalogCount ?: achievements.size
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

    BackHandler(enabled = selectedAchievement != null) {
        selectedAchievement = null
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
                NavButton(
                    label = "Volver",
                    icon = Icons.AutoMirrored.Filled.ArrowBack,
                    onClick = onBack,
                    requestInitialFocus = true
                )
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
                    Text("DESBLOQUEADOS", color = QuantifyTextMuted, fontSize = 15.sp, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
                    Box(
                        Modifier
                            .clip(RoundedCornerShape(999.dp))
                            .background(QuantifyCyan.copy(alpha = 0.14f))
                            .padding(horizontal = 20.dp, vertical = 8.dp)
                    ) {
                        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            CountUpText(target = unlockedCount, fontSize = 26.dp, color = QuantifyCyan)
                            Text("/ $total", color = QuantifyTextMuted, fontSize = 17.sp, fontWeight = FontWeight.Bold)
                        }
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
                        AchievementCard(a, onClick = { selectedAchievement = a })
                    }
                }
            }
        }


        selectedAchievement?.let { achievement ->
            AchievementDetailDialog(
                achievement = achievement,
                onClose = { selectedAchievement = null }
            )
        }
    }
}

@Composable
private fun AchievementCard(achievement: CatalogAchievementDto, onClick: () -> Unit) {
    val accent = accentFor(achievement.rareza)
    FocusableCard(
        onClick = onClick,
        contentPadding = 0.dp,
        showSelectionBadge = false
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
                        text = if (achievement.unlocked) achievement.mes_logro ?: "DESBLOQUEADO" else "BLOQUEADO",
                        color = accent,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp
                    )
                }
                Text(
                    text = achievement.icono ?: if (achievement.unlocked) "🏆" else "🔒",
                    fontSize = 34.sp,
                    modifier = Modifier.alpha(if (achievement.unlocked) 1f else 0.55f)
                )
            }
            Text(
                text = achievement.titulo.ifBlank { "Logro" },
                color = if (achievement.unlocked) QuantifyTextPrimary else QuantifyTextMuted,
                fontSize = 22.sp,
                fontWeight = FontWeight.Black,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = if (achievement.unlocked) achievement.descripcion else achievement.requisito,
                color = QuantifyTextMuted,
                fontSize = 16.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Text(
                text = "${achievement.categoria.uppercase()} · ${achievement.rareza.uppercase()}",
                color = accent,
                fontSize = 11.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp,
                maxLines = 1,
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

@Composable
private fun AchievementDetailDialog(
    achievement: CatalogAchievementDto,
    onClose: () -> Unit
) {
    val accent = accentFor(achievement.rareza)
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black.copy(alpha = 0.9f))
            .padding(56.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth(0.72f)
                .clip(RoundedCornerShape(32.dp))
                .background(QuantifySurface)
                .border(2.dp, accent, RoundedCornerShape(32.dp))
                .padding(36.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            Text(
                text = achievement.icono ?: if (achievement.unlocked) "🏆" else "🔒",
                fontSize = 62.sp
            )
            Text(
                text = achievement.titulo,
                color = QuantifyTextPrimary,
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                textAlign = TextAlign.Center
            )
            Text(
                text = if (achievement.unlocked) "LOGRO DESBLOQUEADO" else "AÚN BLOQUEADO",
                color = accent,
                fontSize = 14.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 2.sp
            )
            Text(
                text = achievement.descripcion,
                color = QuantifyTextMuted,
                fontSize = 18.sp,
                textAlign = TextAlign.Center
            )
            Box(
                Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(accent.copy(alpha = 0.1f))
                    .padding(18.dp)
            ) {
                Text(
                    text = "OBJETIVO: ${achievement.requisito}",
                    color = accent,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            }
            NavButton(
                label = "CERRAR",
                icon = Icons.AutoMirrored.Filled.ArrowBack,
                onClick = onClose,
                requestInitialFocus = true
            )
        }
    }
}

private fun accentFor(rarity: String): Color = when (rarity.lowercase()) {
    "legendario", "legendaria" -> QuantifyWarning
    "épico", "épica" -> Color(0xFFA855F7)
    "raro", "rara" -> QuantifySuccess
    else -> QuantifyCyan
}
