package com.example.smarttv_quantify.ui.pairing

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.scaleIn
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
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarttv_quantify.data.local.SessionStore
import com.example.smarttv_quantify.data.remote.TokenHolder
import com.example.smarttv_quantify.data.repository.QuantifyRepository
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.FocusableCard
import com.example.smarttv_quantify.ui.components.QuantifyLogo
import com.example.smarttv_quantify.ui.theme.Monospace
import com.example.smarttv_quantify.ui.theme.QuantifyBorder
import com.example.smarttv_quantify.ui.theme.QuantifyCyan
import com.example.smarttv_quantify.ui.theme.QuantifySurface
import com.example.smarttv_quantify.ui.theme.QuantifyTextMuted
import com.example.smarttv_quantify.ui.theme.QuantifyTextPrimary
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive

@Composable
fun PairingScreen(
    serverUrl: String,
    sessionStore: SessionStore,
    onConnected: () -> Unit
) {
    var code by remember { mutableStateOf<String?>(null) }
    var visibleDigits by remember { mutableIntStateOf(0) }
    var error by remember { mutableStateOf<String?>(null) }
    var isRequesting by remember { mutableStateOf(true) }
    var requestKey by remember { mutableIntStateOf(0) }

    val repository = remember(serverUrl) { QuantifyRepository(serverUrl) }

    // Solicita un nuevo código de vinculación
    LaunchedEffect(repository, requestKey) {
        isRequesting = true
        error = null
        code = null
        visibleDigits = 0
        runCatching { repository.requestPair() }
            .onSuccess { env ->
                val c = env.data?.code
                if (c != null) {
                    code = c
                    isRequesting = false
                } else {
                    error = env.message ?: "No se pudo generar el código."
                    isRequesting = false
                }
            }
            .onFailure {
                error = "No se pudo conectar con el servidor.\nRevisa la URL en Ajustes."
                isRequesting = false
            }
    }

    // Muestra los dígitos de uno en uno
    LaunchedEffect(code) {
        visibleDigits = 0
        while (visibleDigits < 6) {
            delay(140)
            visibleDigits++
        }
    }

    // Polling: la TV pregunta cada 3s si alguien reclamó el código
    LaunchedEffect(code) {
        val c = code ?: return@LaunchedEffect
        while (isActive) {
            delay(3000)
            val result = runCatching { repository.getPairStatus(c) }
            result.onSuccess { env ->
                val data = env.data
                when (data?.status) {
                    "claimed", "linked" -> {
                        val token = data.token
                        if (token != null) {
                            TokenHolder.token = token
                            sessionStore.setSession(token, data.user?.nombre, data.user?.email)
                            onConnected()
                            return@LaunchedEffect
                        }
                    }
                    "expired", "not_found" -> {
                        error = "El código expiró. Genera uno nuevo."
                        return@LaunchedEffect
                    }
                }
            }
            // Si falla la red, seguimos reintentando sin romper la pantalla
        }
    }

    // Anillos de espera animados
    val infinite = rememberInfiniteTransition(label = "waiting")
    val pulse by infinite.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(900, easing = LinearEasing), RepeatMode.Reverse),
        label = "pulse"
    )
    val glow by infinite.animateFloat(
        initialValue = 0.08f,
        targetValue = 0.2f,
        animationSpec = infiniteRepeatable(tween(1800, easing = LinearEasing), RepeatMode.Reverse),
        label = "glow"
    )

    Box(modifier = Modifier.fillMaxSize()) {
        AmbientBackground()

        // Resplandor central pulsante detrás del código
        Box(
            modifier = Modifier
                .align(Alignment.Center)
                .size(560.dp)
                .clip(RoundedCornerShape(280.dp))
                .background(Brush.radialGradient(listOf(QuantifyCyan.copy(alpha = glow), Color.Transparent)))
        )

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 96.dp, vertical = 72.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            QuantifyLogo(subtitle = "SMART TV")
            Spacer(Modifier.height(24.dp))

            Text(
                text = "Conecta tu Smart TV",
                color = QuantifyTextPrimary,
                fontSize = 54.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = (-1).sp
            )
            Spacer(Modifier.height(14.dp))
            Text(
                text = "Abre Quantify en tu teléfono, entra a \"Conectar TV\"\ny escribe el siguiente código:",
                color = QuantifyTextMuted,
                fontSize = 21.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            Spacer(Modifier.height(48.dp))

            // Código de 6 dígitos
            if (code != null && error == null) {
                Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                    code!!.forEachIndexed { i, digit ->
                        AnimatedVisibility(
                            visible = i < visibleDigits,
                            enter = scaleIn(initialScale = 0.4f, animationSpec = tween(300)) + fadeIn(tween(200))
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(104.dp)
                                    .clip(RoundedCornerShape(24.dp))
                                    .background(
                                        Brush.verticalGradient(listOf(QuantifySurface, Color(0xFF0D0D0D)))
                                    )
                                    .border(2.dp, QuantifyCyan.copy(alpha = 0.5f + pulse * 0.3f), RoundedCornerShape(24.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = digit.toString(),
                                    color = QuantifyTextPrimary,
                                    fontSize = 58.sp,
                                    fontWeight = FontWeight.Black,
                                    fontFamily = Monospace,
                                    letterSpacing = 0.sp
                                )
                            }
                        }
                    }
                }
            }

            Spacer(Modifier.height(44.dp))

            if (isRequesting) {
                Text("GENERANDO CÓDIGO", color = QuantifyCyan.copy(alpha = pulse), fontWeight = FontWeight.Bold, letterSpacing = 4.sp, fontSize = 15.sp)
            } else if (error == null) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    Box(
                        Modifier
                            .size(12.dp)
                            .clip(RoundedCornerShape(6.dp))
                            .background(QuantifyCyan.copy(alpha = pulse))
                    )
                    Text(
                        text = "Esperando confirmación…",
                        color = QuantifyTextMuted.copy(alpha = pulse),
                        fontSize = 19.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Spacer(Modifier.height(16.dp))
                Text(
                    text = "El código caduca en 10 minutos",
                    color = QuantifyTextMuted,
                    fontSize = 15.sp
                )
            }

            if (error != null) {
                Text(
                    text = error ?: "",
                    color = Color(0xFFEF4444),
                    fontSize = 18.sp,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
                Spacer(Modifier.height(28.dp))
                FocusableCard(onClick = { requestKey++ }, cornerRadius = 999.dp, contentPadding = 14.dp) {
                    Text("REINTENTAR", color = QuantifyCyan, fontWeight = FontWeight.Bold, letterSpacing = 2.sp, modifier = Modifier.padding(horizontal = 12.dp))
                }
            }
        }
    }
}
