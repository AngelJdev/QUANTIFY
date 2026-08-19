package com.example.smarttv_quantify.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarttv_quantify.ui.theme.QuantifyBorder
import com.example.smarttv_quantify.ui.theme.QuantifyCyan
import com.example.smarttv_quantify.ui.theme.QuantifySurface
import com.example.smarttv_quantify.ui.theme.QuantifySurfaceElevated
import com.example.smarttv_quantify.ui.theme.QuantifyTextMuted
import com.example.smarttv_quantify.ui.theme.QuantifyTextPrimary

// Fondo abisal con resplandores ambientales estilo Engineering Aesthetic
@Composable
fun AmbientBackground(modifier: Modifier = Modifier) {
    Box(modifier = modifier.fillMaxSize().background(Color(0xFF0A0A0A))) {
        Box(
            Modifier
                .fillMaxSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(QuantifyCyan.copy(alpha = 0.06f), Color.Transparent),
                        radius = 1400f
                    )
                )
        )
        Box(
            Modifier
                .matchParentSize()
                .background(
                    Brush.radialGradient(
                        colors = listOf(Color(0xFF0D47A1).copy(alpha = 0.08f), Color.Transparent)
                    )
                )
        )
    }
}

@Composable
fun QuantifyLogo(modifier: Modifier = Modifier, subtitle: String? = null) {
    Column(modifier) {
        Text(
            text = "QUANTIFY",
            color = QuantifyTextPrimary,
            fontSize = 30.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = 4.sp
        )
        if (subtitle != null) {
            Text(
                text = subtitle,
                color = QuantifyCyan,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 6.sp
            )
        }
    }
}

@Composable
fun FocusableCard(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    cornerRadius: Dp = 28.dp,
    contentPadding: Dp = 24.dp,
    requestInitialFocus: Boolean = false,
    showSelectionBadge: Boolean = true,
    content: @Composable ColumnScope.() -> Unit
) {
    var focused by remember { mutableStateOf(false) }
    val focusRequester = remember { FocusRequester() }
    val borderColor by animateColorAsState(
        targetValue = if (focused) QuantifyCyan else QuantifyBorder,
        animationSpec = tween(180),
        label = "cardBorder"
    )
    val shape = RoundedCornerShape(cornerRadius)

    LaunchedEffect(requestInitialFocus) {
        if (requestInitialFocus) focusRequester.requestFocus()
    }

    Column(
        modifier = modifier
            .clip(shape)
            .background(if (focused) QuantifySurfaceElevated else QuantifySurface)
            .border(if (focused) 3.dp else 1.dp, borderColor, shape)
            .focusRequester(focusRequester)
            .onFocusChanged { focused = it.isFocused }
            .clickable(interactionSource = remember { MutableInteractionSource() }, indication = null, onClick = onClick)
            .padding(contentPadding)
    ) {
        if (showSelectionBadge) {
            Box(
                Modifier
                    .fillMaxWidth()
                    .height(24.dp),
                contentAlignment = Alignment.TopEnd
            ) {
                if (focused) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier
                            .clip(RoundedCornerShape(999.dp))
                            .background(Color(0xE60A0A0A))
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(7.dp)
                                .clip(RoundedCornerShape(4.dp))
                                .background(QuantifyCyan)
                        )
                        Text(
                            text = "SELECCIONADO",
                            color = QuantifyCyan,
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.2.sp
                        )
                    }
                }
            }
        }
        content()
    }
}

@Composable
fun StatCard(
    title: String,
    modifier: Modifier = Modifier,
    accent: Color = QuantifyCyan,
    icon: ImageVector? = null,
    content: @Composable () -> Unit
) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(28.dp))
            .background(QuantifySurface)
            .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
            .padding(horizontal = 28.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            if (icon != null) {
                Box(
                    Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(accent.copy(alpha = 0.16f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(icon, contentDescription = null, tint = accent, modifier = Modifier.size(24.dp))
                }
            }
            Text(
                text = title.uppercase(),
                color = QuantifyTextMuted,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
        Row(verticalAlignment = Alignment.Bottom, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            content()
        }
    }
}

@Composable
fun NavButton(
    label: String,
    icon: ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    selected: Boolean = false,
    requestInitialFocus: Boolean = false
) {
    var focused by remember { mutableStateOf(false) }
    val focusRequester = remember { FocusRequester() }
    val bg by animateColorAsState(
        targetValue = when {
            focused -> QuantifyCyan.copy(alpha = 0.35f)
            selected -> QuantifySurfaceElevated
            else -> QuantifySurface
        },
        animationSpec = tween(180),
        label = "navBg"
    )
    val shape = RoundedCornerShape(18.dp)

    LaunchedEffect(requestInitialFocus) {
        if (requestInitialFocus) focusRequester.requestFocus()
    }

    Row(
        modifier = modifier
            .clip(shape)
            .background(bg)
            .border(if (focused) 3.dp else 1.dp, if (focused) QuantifyCyan else QuantifyBorder, shape)
            .focusRequester(focusRequester)
            .onFocusChanged { focused = it.isFocused }
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClick
            )
            .padding(horizontal = 24.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Icon(icon, contentDescription = null, tint = if (focused) QuantifyCyan else QuantifyTextMuted, modifier = Modifier.size(22.dp))
        Text(
            text = label,
            color = if (focused) QuantifyTextPrimary else QuantifyTextMuted,
            fontSize = 17.sp,
            fontWeight = FontWeight.Bold
        )
        Box(
            Modifier
                .size(7.dp)
                .clip(RoundedCornerShape(4.dp))
                .background(if (focused) QuantifyCyan else Color.Transparent)
        )
    }
}

@Composable
fun SectionTitle(title: String, subtitle: String? = null) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = title,
            color = QuantifyTextPrimary,
            fontSize = 30.sp,
            fontWeight = FontWeight.Black,
            letterSpacing = (-0.5).sp
        )
        if (subtitle != null) {
            Text(text = subtitle, color = QuantifyTextMuted, fontSize = 17.sp)
        }
    }
}

@Composable
fun ErrorPanel(message: String, onRetry: () -> Unit, modifier: Modifier = Modifier) {
    Column(
        modifier = modifier
            .clip(RoundedCornerShape(28.dp))
            .background(QuantifySurface)
            .border(1.dp, QuantifyBorder, RoundedCornerShape(28.dp))
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Text(
            text = "No se pudo cargar la información",
            color = QuantifyTextPrimary,
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold
        )
        Text(text = message, color = QuantifyTextMuted, fontSize = 17.sp)
        FocusableCard(
            onClick = onRetry,
            cornerRadius = 999.dp,
            contentPadding = 16.dp,
            showSelectionBadge = false
        ) {
            Text("REINTENTAR", color = QuantifyCyan, fontWeight = FontWeight.Bold, letterSpacing = 2.sp)
        }
    }
}

@Composable
fun LoadingPlaceholder(modifier: Modifier = Modifier, height: Dp = 28.dp) {
    Box(
        modifier = modifier
            .height(height)
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(QuantifySurfaceElevated)
    )
}
