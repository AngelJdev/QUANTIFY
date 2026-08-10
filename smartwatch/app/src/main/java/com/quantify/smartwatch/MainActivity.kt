package com.quantify.smartwatch

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.TimeText
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.ui.Alignment

/**
 * QUANTIFY Smartwatch — Main Entry Point
 * Hosts the Wear OS Compose UI. Navigation and theming will be
 * configured in Commit 3 (UI Modules 1-2).
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            QuantifyWatchApp()
        }
    }
}

/**
 * Root composable — placeholder until navigation is wired in Commit 3.
 */
@Composable
fun QuantifyWatchApp() {
    MaterialTheme {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            TimeText()
            Text(text = "QUANTIFY")
        }
    }
}
