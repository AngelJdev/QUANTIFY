package com.example.smarttv_quantify.data.remote

// Token JWT de la sesión TV en memoria (lo consume el interceptor de Retrofit)
object TokenHolder {
    @Volatile
    var token: String? = null
}
