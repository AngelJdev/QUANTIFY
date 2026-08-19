package com.example.smarttv_quantify.data.remote

import com.example.smarttv_quantify.BuildConfig
import com.example.smarttv_quantify.data.remote.dto.FlexibleDoubleJsonAdapter
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.HttpException
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit

object ApiClient {

    private var cachedService: ApiService? = null
    private var cachedUrl: String? = null

    // Normaliza la URL ingresada por el usuario (agrega esquema y "/api/" final si falta)
    fun normalizeBaseUrl(input: String?): String {
        var url = input?.trim().orEmpty()
        if (url.isEmpty()) url = BuildConfig.API_BASE_URL
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            url = "http://$url"
        }
        url = url.trimEnd('/')
        return if (url.endsWith("/api")) "$url/" else "$url/api/"
    }

    @Synchronized
    fun service(baseUrl: String? = null): ApiService {
        val normalized = normalizeBaseUrl(baseUrl)
        if (cachedService != null && cachedUrl == normalized) {
            return cachedService!!
        }

        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BASIC
        }

        val client = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(20, TimeUnit.SECONDS)
            .writeTimeout(20, TimeUnit.SECONDS)
            .addInterceptor(logging)
            .addInterceptor { chain ->
                val original = chain.request()
                val request = if (TokenHolder.token.isNullOrEmpty()) {
                    original
                } else {
                    original.newBuilder()
                        .header("Authorization", "Bearer ${TokenHolder.token}")
                        .build()
                }
                chain.proceed(request)
            }
            .build()

        val moshi = Moshi.Builder()
            .add(FlexibleDoubleJsonAdapter())
            .add(KotlinJsonAdapterFactory())
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl(normalized)
            .client(client)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()

        cachedUrl = normalized
        cachedService = retrofit.create(ApiService::class.java)
        return cachedService!!
    }
}

fun Throwable.isAuthenticationFailure(): Boolean =
    this is HttpException && (code() == 401 || code() == 403)

fun Throwable.isPairingCodeExpired(): Boolean =
    this is HttpException && code() == 404
