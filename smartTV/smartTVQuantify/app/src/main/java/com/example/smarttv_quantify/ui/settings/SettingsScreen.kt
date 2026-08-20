package com.example.smarttv_quantify.ui.settings

import androidx.activity.compose.BackHandler
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Link
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.PowerSettingsNew
import androidx.compose.material.icons.filled.Save
import androidx.compose.material.icons.filled.Wifi
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
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.foundation.text.BasicTextField
import com.example.smarttv_quantify.data.local.SessionStore
import com.example.smarttv_quantify.BuildConfig
import com.example.smarttv_quantify.data.remote.ApiClient
import com.example.smarttv_quantify.data.remote.TokenHolder
import com.example.smarttv_quantify.data.repository.QuantifyRepository
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.NavButton
import com.example.smarttv_quantify.ui.components.QuantifyLogo
import com.example.smarttv_quantify.ui.theme.Monospace
import com.example.smarttv_quantify.ui.theme.QuantifyBorder
import com.example.smarttv_quantify.ui.theme.QuantifyCyan
import com.example.smarttv_quantify.ui.theme.QuantifySurface
import com.example.smarttv_quantify.ui.theme.QuantifySurfaceElevated
import com.example.smarttv_quantify.ui.theme.QuantifySuccess
import com.example.smarttv_quantify.ui.theme.QuantifyTextMuted
import com.example.smarttv_quantify.ui.theme.QuantifyTextPrimary
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(
    serverUrl: String,
    userName: String?,
    userEmail: String?,
    isLinked: Boolean,
    sessionStore: SessionStore,
    onBack: () -> Unit,
    onDisconnected: () -> Unit
) {
    BackHandler(onBack = onBack)

    val scope = rememberCoroutineScope()
    var urlInput by remember { mutableStateOf(serverUrl) }
    var saving by remember { mutableStateOf(false) }
    var testResult by remember { mutableStateOf<String?>(null) }
    var testOk by remember { mutableStateOf(false) }
    var disconnecting by remember { mutableStateOf(false) }

    val repo = remember(serverUrl) { QuantifyRepository(serverUrl) }

    fun guardarYProbar(newUrl: String) {
        scope.launch {
            saving = true
            testResult = null
            val normalized = ApiClient.normalizeBaseUrl(newUrl)
            sessionStore.setServerUrl(normalized)
            val ok = runCatching {
                val probe = QuantifyRepository(normalized)
                probe.health()
            }.getOrNull()?.status == "OK"
            testOk = ok
            testResult = if (ok) "Conexión correcta. Servidor guardado." else "No se pudo conectar con ese servidor."
            urlInput = normalized
            saving = false
        }
    }

    fun desconectar() {
        scope.launch {
            disconnecting = true
            runCatching { repo.disconnect() }
            sessionStore.clearSession()
            TokenHolder.token = null
            onDisconnected()
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        AmbientBackground()

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 64.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
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
                QuantifyLogo(subtitle = "AJUSTES")
            }

            // ===== Header =====
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "CONFIGURACIÓN",
                    color = QuantifyCyan,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 4.sp
                )
                Text(
                    text = "Ajustes de tu Smart TV",
                    color = QuantifyTextPrimary,
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Black,
                    letterSpacing = (-1).sp
                )
            }

            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                verticalAlignment = Alignment.Top
            ) {
                // ===== Servidor =====
                Column(
                    modifier = Modifier
                        .weight(1.5f)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(28.dp))
                        .background(QuantifySurface)
                        .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
                        .padding(22.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(
                            Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(QuantifyCyan.copy(alpha = 0.16f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.Wifi, contentDescription = null, tint = QuantifyCyan)
                        }
                        Text(
                            text = "SERVIDOR QUANTIFY",
                            color = QuantifyTextPrimary,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
                    Text(
                        text = "URL del servidor donde corre la API de Quantify.",
                        color = QuantifyTextMuted,
                        fontSize = 16.sp
                    )
                    UrlInputField(value = urlInput, onValueChange = { urlInput = it })
                    Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        UrlPreset("Producción", BuildConfig.PRODUCTION_API_BASE_URL, urlInput) { guardarYProbar(it) }
                        UrlPreset("Emulador", BuildConfig.LOCAL_API_BASE_URL, urlInput) { guardarYProbar(it) }
                        UrlPreset("Físico", "http://192.168.1.100:5001/", urlInput) { guardarYProbar(it) }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(14.dp)) {
                        ActionButton(
                            label = if (saving) "PROBANDO…" else "GUARDAR Y PROBAR",
                            icon = Icons.Filled.Save,
                            onClick = { guardarYProbar(urlInput) },
                            enabled = !saving
                        )
                        if (testResult != null) {
                            Text(
                                text = testResult ?: "",
                                color = if (testOk) QuantifySuccess else Color(0xFFEF4444),
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                // ===== Vinculación =====
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(28.dp))
                        .background(QuantifySurface)
                        .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
                        .padding(22.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        Box(
                            Modifier
                                .size(44.dp)
                                .clip(RoundedCornerShape(14.dp))
                                .background(QuantifyCyan.copy(alpha = 0.16f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Filled.Link, contentDescription = null, tint = QuantifyCyan)
                        }
                        Text(
                            text = "VINCULACIÓN",
                            color = QuantifyTextPrimary,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(18.dp))
                            .background(QuantifySurfaceElevated)
                            .padding(18.dp)
                    ) {
                        Icon(Icons.Filled.Person, contentDescription = null, tint = QuantifyCyan, modifier = Modifier.size(34.dp))
                        Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                            Text(
                                text = userName ?: "Sin sesión",
                                color = QuantifyTextPrimary,
                                fontSize = 19.sp,
                                fontWeight = FontWeight.Bold,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                            Text(
                                text = userEmail ?: "Vincula la TV con tu cuenta",
                                color = QuantifyTextMuted,
                                fontSize = 14.sp,
                                maxLines = 1,
                                overflow = TextOverflow.Ellipsis
                            )
                        }
                    }
                    if (isLinked) {
                        Text(
                            text = "Al desconectar, esta TV deja de mostrar tus métricas hasta vincularla de nuevo con un código.",
                            color = QuantifyTextMuted,
                            fontSize = 15.sp
                        )
                        ActionButton(
                            label = if (disconnecting) "DESCONECTANDO…" else "DESCONECTAR TV",
                            icon = Icons.Filled.PowerSettingsNew,
                            danger = true,
                            onClick = ::desconectar,
                            enabled = !disconnecting
                        )
                    } else {
                        Text(
                            text = "Selecciona y prueba un servidor, luego vuelve para generar tu código.",
                            color = QuantifyCyan,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

        }
    }
}

@Composable
private fun UrlInputField(value: String, onValueChange: (String) -> Unit) {
    var focused by remember { mutableStateOf(false) }
    val borderColor by animateColorAsState(
        targetValue = if (focused) QuantifyCyan else QuantifyBorder,
        animationSpec = tween(180),
        label = "urlBorder"
    )
    BasicTextField(
        value = value,
        onValueChange = onValueChange,
        singleLine = true,
        textStyle = TextStyle(
            color = QuantifyTextPrimary,
            fontSize = 18.sp,
            fontFamily = Monospace,
            fontWeight = FontWeight.Bold
        ),
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(QuantifySurfaceElevated)
            .border(2.dp, borderColor, RoundedCornerShape(16.dp))
            .onFocusChanged { focused = it.isFocused }
            .padding(horizontal = 18.dp, vertical = 6.dp)
    )
}

@Composable
private fun UrlPreset(label: String, url: String, current: String, onApply: (String) -> Unit) {
    val active = ApiClient.normalizeBaseUrl(url) == ApiClient.normalizeBaseUrl(current)
    ActionButton(label = label, icon = Icons.Filled.Wifi, compact = true, active = active, onClick = { onApply(url) })
}

@Composable
private fun ActionButton(
    label: String,
    icon: ImageVector,
    onClick: () -> Unit,
    danger: Boolean = false,
    compact: Boolean = false,
    active: Boolean = false,
    enabled: Boolean = true
) {
    var focused by remember { mutableStateOf(false) }
    val accent = if (danger) Color(0xFFEF4444) else QuantifyCyan
    val bg by animateColorAsState(
        targetValue = when {
            focused -> accent.copy(alpha = 0.28f)
            active -> accent.copy(alpha = 0.16f)
            else -> Color.Transparent
        },
        animationSpec = tween(180),
        label = "actionBg"
    )
    val shape = RoundedCornerShape(if (compact) 999.dp else 16.dp)
    Row(
        modifier = Modifier
            .clip(shape)
            .background(bg)
            .border(if (focused) 3.dp else 1.dp, if (focused) accent else accent.copy(alpha = if (active) 0.9f else 0.25f), shape)
            .onFocusChanged { focused = it.isFocused }
            .clickableNoRipple(enabled, onClick)
            .padding(horizontal = if (compact) 16.dp else 22.dp, vertical = if (compact) 10.dp else 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Icon(icon, contentDescription = null, tint = if (focused) accent else if (danger) Color(0xFFEF4444).copy(alpha = 0.8f) else accent, modifier = Modifier.size(22.dp))
        Text(
            text = label,
            color = if (focused) QuantifyTextPrimary else if (danger) Color(0xFFEF4444) else accent,
            fontSize = if (compact) 15.sp else 17.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.sp
        )
    }
}

@Composable
private fun Modifier.clickableNoRipple(enabled: Boolean, onClick: () -> Unit): Modifier =
    clickable(
        interactionSource = remember { MutableInteractionSource() },
        indication = null,
        enabled = enabled,
        onClick = onClick
    )
