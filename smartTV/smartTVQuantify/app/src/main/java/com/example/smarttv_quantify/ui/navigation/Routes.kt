package com.example.smarttv_quantify.ui.navigation

object Routes {
    const val PAIRING = "pairing"
    const val DASHBOARD = "dashboard"
    const val HABIT = "habit/{habitId}?name={name}"
    const val ACHIEVEMENTS = "achievements"
    const val SETTINGS = "settings"

    const val ARG_HABIT_ID = "habitId"
    const val ARG_HABIT_NAME = "name"

    fun habit(habitId: Long, name: String?): String {
        val safeName = java.net.URLEncoder.encode(name ?: "", "UTF-8")
        return "habit/$habitId?name=$safeName"
    }
}
