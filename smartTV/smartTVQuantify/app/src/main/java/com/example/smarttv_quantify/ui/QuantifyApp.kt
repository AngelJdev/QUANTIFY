package com.example.smarttv_quantify.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavType
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.example.smarttv_quantify.data.local.Session
import com.example.smarttv_quantify.data.local.SessionStore
import com.example.smarttv_quantify.data.remote.TokenHolder
import com.example.smarttv_quantify.ui.achievements.AchievementsScreen
import com.example.smarttv_quantify.ui.components.AmbientBackground
import com.example.smarttv_quantify.ui.components.QuantifyLogo
import com.example.smarttv_quantify.ui.dashboard.DashboardScreen
import com.example.smarttv_quantify.ui.habit.HabitDetailScreen
import com.example.smarttv_quantify.ui.navigation.Routes
import com.example.smarttv_quantify.ui.pairing.PairingScreen
import com.example.smarttv_quantify.ui.settings.SettingsScreen
import com.example.smarttv_quantify.ui.theme.QuantifyCyan
import com.example.smarttv_quantify.ui.theme.QuantifyTextMuted
import kotlinx.coroutines.launch

@Composable
fun QuantifyApp(sessionStore: SessionStore) {
    val session by sessionStore.session.collectAsState(initial = Session())
    val navController = rememberNavController()
    val scope = rememberCoroutineScope()

    // Restaura el token al abrir la app
    LaunchedEffect(session.token) {
        TokenHolder.token = session.token
    }

    if (!session.loaded) {
        SplashScreen()
        return
    }

    val serverUrl = session.serverUrl
    val clearSessionAndPair: () -> Unit = {
        scope.launch {
            sessionStore.clearSession()
            TokenHolder.token = null
            navController.navigate(Routes.PAIRING) {
                popUpTo(navController.graph.findStartDestination().id) { inclusive = true }
                launchSingleTop = true
            }
        }
    }

    NavHost(
        navController = navController,
        startDestination = if (session.token != null) Routes.DASHBOARD else Routes.PAIRING
    ) {
        composable(Routes.PAIRING) {
            PairingScreen(
                serverUrl = serverUrl,
                sessionStore = sessionStore,
                onConnected = {
                    navController.navigate(Routes.DASHBOARD) {
                        popUpTo(Routes.PAIRING) { inclusive = true }
                    }
                },
                onOpenSettings = { navController.navigate(Routes.SETTINGS) }
            )
        }

        composable(Routes.DASHBOARD) {
            DashboardScreen(
                userName = session.userName,
                serverUrl = serverUrl,
                onOpenHabit = { id, name -> navController.navigate(Routes.habit(id, name)) },
                onOpenAchievements = { navController.navigate(Routes.ACHIEVEMENTS) },
                onOpenSettings = { navController.navigate(Routes.SETTINGS) },
                onSessionExpired = clearSessionAndPair
            )
        }

        composable(
            route = Routes.HABIT,
            arguments = listOf(
                navArgument(Routes.ARG_HABIT_ID) { type = NavType.LongType },
                navArgument(Routes.ARG_HABIT_NAME) {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                }
            )
        ) {
            val habitId = it.arguments?.getLong(Routes.ARG_HABIT_ID) ?: 0L
            val habitName = it.arguments?.getString(Routes.ARG_HABIT_NAME)
            HabitDetailScreen(
                habitId = habitId,
                habitName = habitName,
                serverUrl = serverUrl,
                onBack = { navController.popBackStack() },
                onSessionExpired = clearSessionAndPair
            )
        }

        composable(Routes.ACHIEVEMENTS) {
            AchievementsScreen(
                serverUrl = serverUrl,
                onBack = { navController.popBackStack() },
                onSessionExpired = clearSessionAndPair
            )
        }

        composable(Routes.SETTINGS) {
            SettingsScreen(
                serverUrl = serverUrl,
                userName = session.userName,
                userEmail = session.userEmail,
                isLinked = session.token != null,
                sessionStore = sessionStore,
                onBack = { navController.popBackStack() },
                onDisconnected = clearSessionAndPair
            )
        }
    }
}

@Composable
private fun SplashScreen() {
    val infinite = rememberInfiniteTransition(label = "splash")
    val pulse by infinite.animateFloat(
        initialValue = 0.5f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(tween(900, easing = LinearEasing), RepeatMode.Reverse),
        label = "pulse"
    )

    Box(modifier = Modifier.fillMaxSize()) {
        AmbientBackground()
        Column(
            modifier = Modifier.align(Alignment.Center),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            QuantifyLogo(subtitle = "SMART TV")
            Spacer(Modifier.height(28.dp))
            Text(
                text = "CONECTANDO",
                color = QuantifyCyan.copy(alpha = pulse),
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                letterSpacing = 6.sp
            )
        }
    }
}
