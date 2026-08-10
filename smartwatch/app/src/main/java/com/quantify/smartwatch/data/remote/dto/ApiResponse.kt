package com.quantify.smartwatch.data.remote.dto

/**
 * Standard API response wrapper from the QUANTIFY backend.
 * Every endpoint returns this structure:
 * { success: boolean, message: string, data: T? }
 *
 * See: backend/utils/response.js
 */
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T? = null
)
