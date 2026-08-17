package com.quantify.smartwatch.data.remote.dto

/**
 * Response from POST /api/auth/login
 * Maps to: auth.controller.js → login()
 *
 * user fields from User.toJSON() (password_hash excluded):
 * id, nombre, username, email, rol, current_streak, max_streak, etc.
 */
data class LoginResponse(
    val user: UserDto,
    val token: String
)

data class UserDto(
    val id: Int,
    val nombre: String,
    val username: String? = null,
    val email: String,
    val rol: Int = 1,
    val current_streak: Int = 0,
    val max_streak: Int = 0,
    val avatar_url: String? = null,
    val needsOnboarding: Boolean = false
)
