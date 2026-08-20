package com.example.smarttv_quantify

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.example.smarttv_quantify.data.local.SessionStore
import com.example.smarttv_quantify.ui.QuantifyApp
import com.example.smarttv_quantify.ui.theme.SmartTVQuantifyTheme

class MainActivity : ComponentActivity() {

    private lateinit var sessionStore: SessionStore

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        sessionStore = SessionStore(applicationContext)
        enableEdgeToEdge()
        setContent {
            SmartTVQuantifyTheme {
                QuantifyApp(sessionStore = sessionStore)
            }
        }
    }
}
