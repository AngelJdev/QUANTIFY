package com.quantify.smartwatch

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.quantify.smartwatch.ui.navigation.WatchNavigation
import com.quantify.smartwatch.ui.theme.QuantifyWatchTheme

/**
 * QUANTIFY Smartwatch — Main Entry Point
 * Hosts the Wear OS Compose UI with Engineering Aesthetic theme
 * and full navigation across all 5 modules.
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuantifyWatchTheme {
                WatchNavigation()
            }
        }
    }
}
