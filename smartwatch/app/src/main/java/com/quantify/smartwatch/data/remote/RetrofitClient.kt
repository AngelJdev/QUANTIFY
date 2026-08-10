package com.quantify.smartwatch.data.remote

import com.quantify.smartwatch.BuildConfig
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Singleton Retrofit client for the QUANTIFY API.
 *
 * Base URL defaults to BuildConfig.API_BASE_URL (10.0.2.2:5000 for emulator).
 * JWT token is injected via an OkHttp interceptor, matching the backend's
 * auth.middleware.js expectation of "Bearer <token>" in the Authorization header.
 */
object RetrofitClient {

    private var token: String? = null
    private var baseUrl: String = BuildConfig.API_BASE_URL

    fun setToken(jwt: String?) {
        token = jwt
    }

    fun setBaseUrl(url: String) {
        baseUrl = url
    }

    /**
     * Auth interceptor — attaches "Bearer <token>" header.
     * Mirrors the frontend's axios interceptor in services/api.js
     */
    private val authInterceptor = Interceptor { chain ->
        val request = chain.request().newBuilder().apply {
            token?.let {
                addHeader("Authorization", "Bearer $it")
            }
            addHeader("Content-Type", "application/json")
        }.build()
        chain.proceed(request)
    }

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val httpClient: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .addInterceptor(authInterceptor)
            .addInterceptor(loggingInterceptor)
            .connectTimeout(15, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)
            .build()
    }

    val apiService: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl("$baseUrl/")
            .client(httpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }
}
