package com.quantify.smartwatch.ui.navigation

import androidx.compose.runtime.*
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.quantify.smartwatch.data.remote.RetrofitClient
import com.quantify.smartwatch.ui.auth.*
import com.quantify.smartwatch.ui.habits.*
import com.quantify.smartwatch.ui.progress.*
import com.quantify.smartwatch.ui.settings.*
import com.quantify.smartwatch.ui.stopwatch.*
import com.quantify.smartwatch.ui.watchface.*
import com.quantify.smartwatch.ui.viewmodel.*

/**
 * Main navigation graph for the QUANTIFY Smartwatch.
 *
 * Navigation structure:
 * ┌─ splash → auth flow (if not paired) → watchface (home)
 * ├─ watchface ←→ habits (swipe left)
 * ├─ watchface ←→ stopwatch (swipe right / direct button)
 * ├─ watchface → quick_status (swipe down)
 * └─ watchface → settings (swipe up)
 */
object Routes {
    // Module 1: Auth
    const val SPLASH = "splash"
    const val NOT_CONFIGURED = "not_configured"
    const val WIFI_CHECK = "wifi_check"
    const val PAIRING_CODE = "pairing_code"
    const val WAITING_AUTH = "waiting_auth"
    const val AUTH_SUCCESS = "auth_success/{email}"
    const val AUTH_ERROR = "auth_error/{message}"

    // Module 2: Watchface & Tools
    const val WATCHFACE = "watchface"
    const val QUICK_STATUS = "quick_status"
    const val STOPWATCH = "stopwatch"

    // Module 3: Habits
    const val HABIT_LIST = "habit_list"
    const val HABIT_DETAIL = "habit_detail/{habitId}"
    const val HABIT_NUMERIC = "habit_numeric/{habitId}"
    const val HABIT_FEEDBACK = "habit_feedback"
    const val DAY_COMPLETE = "day_complete"

    // Module 4: Progress
    const val WEEKLY_SUMMARY = "weekly_summary"
    const val LIVE_TELEMETRY = "live_telemetry"
    const val STREAK_STATS = "streak_stats"

    // Module 5: Settings
    const val SETTINGS = "settings"
    const val UNLINK = "unlink"
    const val UNLINK_CONFIRM = "unlink_confirm"
    const val ABOUT = "about"
}

@Composable
fun WatchNavigation() {
    val navController = rememberSwipeDismissableNavController()
    val authVm: AuthViewModel = viewModel()
    val watchfaceVm: WatchfaceViewModel = viewModel()
    val habitVm: HabitViewModel = viewModel()
    val progressVm: ProgressViewModel = viewModel()
    val settingsVm: SettingsViewModel = viewModel()

    // Observe auth state to determine start destination
    val authState by authVm.uiState.collectAsState()
    val pairingCode by authVm.pairingCode.collectAsState()

    LaunchedEffect(Unit) {
        RetrofitClient.onUnauthorized = {
            authVm.unlinkLocal()
            navController.navigate(Routes.NOT_CONFIGURED) {
                popUpTo(navController.graph.startDestinationId) { inclusive = true }
                launchSingleTop = true
            }
        }
    }

    SwipeDismissableNavHost(
        navController = navController,
        startDestination = Routes.SPLASH
    ) {
        // ═══════════════════════════════════════
        // MODULE 1: Auth Flow
        // ═══════════════════════════════════════

        composable(Routes.SPLASH) {
            SplashScreen(
                onFinished = {
                    val dest = if (authState is AuthUiState.Authenticated)
                        Routes.WATCHFACE else Routes.NOT_CONFIGURED
                    navController.navigate(dest) {
                        popUpTo(Routes.SPLASH) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.NOT_CONFIGURED) {
            NotConfiguredScreen(
                onConfigure = {
                    authVm.startPairing()
                    navController.navigate(Routes.WIFI_CHECK)
                }
            )
        }

        composable(Routes.WIFI_CHECK) {
            LaunchedEffect(authState) {
                when (authState) {
                    is AuthUiState.ShowingCode -> navController.navigate(Routes.PAIRING_CODE) {
                        popUpTo(Routes.WIFI_CHECK) { inclusive = true }
                    }
                    is AuthUiState.WifiRequired -> { /* stay here */ }
                    is AuthUiState.Error -> navController.navigate(
                        "auth_error/${(authState as AuthUiState.Error).message}"
                    )
                    else -> {}
                }
            }
            WifiCheckScreen(onRetry = { authVm.retryConnection() })
        }

        composable(Routes.PAIRING_CODE) {
            LaunchedEffect(authState) {
                when (authState) {
                    is AuthUiState.Success -> navController.navigate(
                        "auth_success/${(authState as AuthUiState.Success).email}"
                    ) { popUpTo(Routes.PAIRING_CODE) { inclusive = true } }
                    is AuthUiState.Authenticated -> navController.navigate(Routes.WATCHFACE) {
                        popUpTo(0) { inclusive = true }
                    }
                    is AuthUiState.Error -> navController.navigate(
                        "auth_error/${(authState as AuthUiState.Error).message}"
                    )
                    else -> {}
                }
            }
            PairingCodeScreen(
                code = pairingCode,
                onRegenerate = { authVm.regenerateCode() }
            )
        }

        composable(Routes.WAITING_AUTH) {
            LaunchedEffect(authState) {
                when (authState) {
                    is AuthUiState.Success -> navController.navigate(
                        "auth_success/${(authState as AuthUiState.Success).email}"
                    ) { popUpTo(Routes.WAITING_AUTH) { inclusive = true } }
                    is AuthUiState.CodeExpired -> navController.navigate(Routes.PAIRING_CODE) {
                        popUpTo(Routes.WAITING_AUTH) { inclusive = true }
                    }
                    is AuthUiState.Authenticated -> navController.navigate(Routes.WATCHFACE) {
                        popUpTo(0) { inclusive = true }
                    }
                    else -> {}
                }
            }
            WaitingAuthScreen()
        }

        composable("auth_success/{email}") { backStackEntry ->
            val email = backStackEntry.arguments?.getString("email") ?: ""
            AuthResultScreen(
                isSuccess = true,
                email = email,
                onContinue = {
                    navController.navigate(Routes.WATCHFACE) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable("auth_error/{message}") { backStackEntry ->
            val message = backStackEntry.arguments?.getString("message") ?: ""
            AuthResultScreen(
                isSuccess = false,
                errorMessage = message,
                onRetry = {
                    navController.navigate(Routes.NOT_CONFIGURED) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        // ═══════════════════════════════════════
        // MODULE 2: Watchface
        // ═══════════════════════════════════════

        composable(Routes.WATCHFACE) {
            val completion by watchfaceVm.completionPercent.collectAsState()
            val streak by watchfaceVm.currentStreak.collectAsState()
            val completed by watchfaceVm.completedToday.collectAsState()
            val total by watchfaceVm.totalHabits.collectAsState()

            LaunchedEffect(Unit) { watchfaceVm.loadDashboardData() }

            WatchfaceScreen(
                completionPercent = completion,
                currentStreak = streak,
                completedToday = completed,
                totalHabits = total,
                onNavigateToHabits = { navController.navigate(Routes.HABIT_LIST) },
                onNavigateToStopwatch = { navController.navigate(Routes.STOPWATCH) },
                onNavigateToSettings = { navController.navigate(Routes.SETTINGS) }
            )
        }

        composable(Routes.STOPWATCH) {
            StopwatchScreen(onBack = { navController.popBackStack() })
        }

        composable(Routes.QUICK_STATUS) {
            val isOnline by watchfaceVm.isOnline.collectAsState()
            val lastSync by watchfaceVm.lastSync.collectAsState()
            val pending by watchfaceVm.pendingActions.collectAsState()

            QuickStatusScreen(
                isOnline = isOnline,
                lastSyncText = watchfaceVm.getTimeSinceLastSync(lastSync),
                pendingActions = pending,
                onSyncNow = { watchfaceVm.syncNow() }
            )
        }

        // ═══════════════════════════════════════
        // MODULE 3: Habits (screens added in Commit 4)
        // ═══════════════════════════════════════

        composable(Routes.HABIT_LIST) {
            HabitListScreen(
                viewModel = habitVm,
                onHabitTap = { habit ->
                    val route = if (habit.tipo_medicion == "BOOLEANO")
                        "habit_detail/${habit.id}"
                    else
                        "habit_numeric/${habit.id}"
                    navController.navigate(route)
                },
                onAllCompleted = { navController.navigate(Routes.DAY_COMPLETE) }
            )
        }

        composable("habit_detail/{habitId}") { backStackEntry ->
            val habitId = backStackEntry.arguments?.getString("habitId")?.toIntOrNull() ?: return@composable
            HabitDetailScreen(
                habitId = habitId,
                viewModel = habitVm,
                onCompleted = { navController.navigate(Routes.HABIT_FEEDBACK) }
            )
        }

        composable("habit_numeric/{habitId}") { backStackEntry ->
            val habitId = backStackEntry.arguments?.getString("habitId")?.toIntOrNull() ?: return@composable
            HabitNumericInputScreen(
                habitId = habitId,
                viewModel = habitVm,
                onRegistered = { navController.navigate(Routes.HABIT_FEEDBACK) }
            )
        }

        composable(Routes.HABIT_FEEDBACK) {
            val allCompleted by habitVm.allCompleted.collectAsState()
            HabitFeedbackScreen(
                onFinished = {
                    if (allCompleted) {
                        navController.navigate(Routes.DAY_COMPLETE) {
                            popUpTo(Routes.HABIT_LIST) { inclusive = true }
                        }
                    } else {
                        navController.navigate(Routes.HABIT_LIST) {
                            popUpTo(Routes.HABIT_LIST) { inclusive = true }
                        }
                    }
                }
            )
        }

        composable(Routes.DAY_COMPLETE) {
            DayCompleteScreen(
                onContinue = {
                    navController.navigate(Routes.WATCHFACE) {
                        popUpTo(Routes.WATCHFACE) { inclusive = true }
                        launchSingleTop = true
                    }
                }
            )
        }

        // ═══════════════════════════════════════
        // MODULE 4: Progress (screens added in Commit 4)
        // ═══════════════════════════════════════

        composable(Routes.WEEKLY_SUMMARY) {
            WeeklySummaryScreen(
                viewModel = progressVm,
                onNavigateToHome = {
                    navController.navigate(Routes.WATCHFACE) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable(Routes.LIVE_TELEMETRY) {
            LiveTelemetryScreen()
        }

        composable(Routes.STREAK_STATS) {
            StreakStatsScreen(viewModel = progressVm)
        }

        // ═══════════════════════════════════════
        // MODULE 5: Settings (screens added in Commit 4)
        // ═══════════════════════════════════════

        composable(Routes.SETTINGS) {
            SettingsMenuScreen(
                viewModel = settingsVm,
                onUnlink = { navController.navigate(Routes.UNLINK) },
                onAbout = { navController.navigate(Routes.ABOUT) }
            )
        }

        composable(Routes.UNLINK) {
            UnlinkScreen(
                onConfirm = { navController.navigate(Routes.UNLINK_CONFIRM) }
            )
        }

        composable(Routes.UNLINK_CONFIRM) {
            UnlinkConfirmScreen(
                viewModel = settingsVm,
                onConfirmed = {
                    navController.navigate(Routes.NOT_CONFIGURED) {
                        popUpTo(0) { inclusive = true }
                    }
                },
                onCancel = { navController.popBackStack() }
            )
        }

        composable(Routes.ABOUT) {
            AboutScreen()
        }
    }
}
