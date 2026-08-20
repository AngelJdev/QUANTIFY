package com.example.smarttv_quantify.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.smarttv_quantify.ui.theme.Monospace
import com.example.smarttv_quantify.ui.theme.QuantifyCyan
import com.example.smarttv_quantify.ui.theme.QuantifyTextMuted
import com.example.smarttv_quantify.ui.theme.QuantifyTextPrimary
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

// Número que "cuenta" desde 0 hasta el valor objetivo al entrar en pantalla
@Composable
fun CountUpText(
    target: Int,
    modifier: Modifier = Modifier,
    fontSize: Dp = 40.dp,
    suffix: String = "",
    color: Color = QuantifyTextPrimary,
    prefix: String = ""
) {
    val anim = remember { Animatable(0f) }
    LaunchedEffect(target) {
        anim.animateTo(target.toFloat(), animationSpec = tween(1000, easing = FastOutSlowInEasing))
    }
    val value = anim.value
    Text(
        text = "$prefix${value.roundToInt()}$suffix",
        modifier = modifier,
        color = color,
        fontSize = fontSize.value.sp,
        fontWeight = FontWeight.Black,
        fontFamily = Monospace,
        letterSpacing = (-1).sp
    )
}

// Gráfica de barras animadas (los valores crecen de abajo hacia arriba)
@Composable
fun AnimatedBarChart(
    data: List<Float>,
    modifier: Modifier = Modifier,
    color: Color = QuantifyCyan
) {
    val progress = remember { Animatable(0f) }
    LaunchedEffect(data) {
        progress.snapTo(0f)
        progress.animateTo(1f, animationSpec = tween(1000, easing = FastOutSlowInEasing))
    }

    Canvas(modifier = modifier) {
        if (data.isEmpty()) return@Canvas
        val max = (data.maxOrNull() ?: 1f).coerceAtLeast(1f)
        val slot = size.width / data.size
        val barWidth = slot * 0.55f
        val corner = CornerRadius(barWidth / 2f, barWidth / 2f)

        data.forEachIndexed { i, v ->
            val h = ((v / max) * size.height).coerceAtLeast(2f) * progress.value
            val left = slot * i + (slot - barWidth) / 2f
            val top = size.height - h
            drawRoundRect(
                brush = Brush.verticalGradient(
                    colors = listOf(color.copy(alpha = 0.45f), color)
                ),
                topLeft = Offset(left, top),
                size = Size(barWidth, h),
                cornerRadius = corner
            )
        }
    }
}

// Gráfica de línea con relleno degradado (se dibuja de izquierda a derecha)
@Composable
fun AnimatedLineChart(
    data: List<Float>,
    modifier: Modifier = Modifier,
    color: Color = QuantifyCyan
) {
    val progress = remember { Animatable(0f) }
    LaunchedEffect(data) {
        progress.snapTo(0f)
        progress.animateTo(1f, animationSpec = tween(1100, easing = LinearEasing))
    }

    Canvas(modifier = modifier) {
        if (data.isEmpty()) return@Canvas
        val n = data.size
        val max = (data.maxOrNull() ?: 1f).coerceAtLeast(1f)
        val stepX = if (n > 1) size.width / (n - 1) else 0f
        val points = data.mapIndexed { i, v ->
            Offset(stepX * i, size.height - (v / max) * size.height)
        }

        if (n == 1) {
            drawCircle(color, radius = 6.dp.toPx(), center = points.first())
            return@Canvas
        }

        val drawTo = progress.value * (n - 1)
        val path = Path()
        var last: Offset = points.first()

        if (drawTo <= 0f) {
            drawCircle(color, radius = 6.dp.toPx(), center = points.first())
            return@Canvas
        }

        path.moveTo(points.first().x, points.first().y)
        for (i in 1 until n) {
            if (i.toFloat() > drawTo) break
            path.lineTo(points[i].x, points[i].y)
            last = points[i]
        }
        if (drawTo < (n - 1)) {
            val segIdx = drawTo.toInt().coerceIn(0, n - 2)
            val frac = drawTo - segIdx
            val a = points[segIdx]
            val b = points[segIdx + 1]
            val partial = Offset(a.x + (b.x - a.x) * frac, a.y + (b.y - a.y) * frac)
            path.lineTo(partial.x, partial.y)
            last = partial
        }

        val area = Path().apply {
            addPath(path)
            lineTo(last.x, size.height)
            lineTo(points.first().x, size.height)
            close()
        }
        drawPath(
            path = area,
            brush = Brush.verticalGradient(
                colors = listOf(color.copy(alpha = 0.22f), Color.Transparent)
            )
        )
        drawPath(
            path = path,
            color = color,
            style = Stroke(width = 6f, cap = StrokeCap.Round, join = StrokeJoin.Round)
        )
        drawCircle(color, radius = 8.dp.toPx(), center = last)
        drawCircle(Color.Black, radius = 3.dp.toPx(), center = last)
    }
}

// Gauge radial de progreso (se anima con barrido en arco)
@Composable
fun RadialGauge(
    value: Float,
    modifier: Modifier = Modifier,
    color: Color = QuantifyCyan,
    trackColor: Color = Color(0xFF1E293B),
    strokeWidth: Dp = 18.dp
) {
    val progress by animateFloatAsState(
        targetValue = (value / 100f).coerceIn(0f, 1f),
        animationSpec = tween(1100, easing = FastOutSlowInEasing),
        label = "gaugeProgress"
    )

    Canvas(modifier = modifier) {
        val stroke = strokeWidth.toPx()
        val diameter = size.minDimension - stroke
        val arcSize = Size(diameter, diameter)
        val topLeft = Offset((size.width - diameter) / 2f, (size.height - diameter) / 2f)

        drawArc(
            color = trackColor,
            startAngle = -90f,
            sweepAngle = 360f,
            useCenter = false,
            topLeft = topLeft,
            size = arcSize,
            style = Stroke(width = stroke, cap = StrokeCap.Round)
        )
        drawArc(
            brush = Brush.sweepGradient(
                colors = listOf(color, color.copy(alpha = 0.5f)),
                center = center
            ),
            startAngle = -90f,
            sweepAngle = 360f * progress,
            useCenter = false,
            topLeft = topLeft,
            size = arcSize,
            style = Stroke(width = stroke, cap = StrokeCap.Round)
        )
    }
}

// Etiquetas de fecha para gráficas
@Composable
fun ChartLabels(labels: List<String>, modifier: Modifier = Modifier) {
    Row(modifier = modifier.fillMaxSize()) {
        if (labels.isEmpty()) return@Row
        labels.forEach { label ->
            Text(
                text = label,
                color = QuantifyTextMuted,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                textAlign = TextAlign.Center,
                modifier = Modifier.weight(1f)
            )
        }
    }
}
