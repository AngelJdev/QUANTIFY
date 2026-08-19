package com.example.smarttv_quantify

import com.example.smarttv_quantify.data.remote.ApiClient
import org.junit.Test
import org.junit.Assert.assertEquals

class ApiClientTest {
    @Test
    fun normalizeBaseUrl_preservesProductionServer() {
        assertEquals(
            "https://quantify-zeta-hazel.vercel.app/api/",
            ApiClient.normalizeBaseUrl("https://quantify-zeta-hazel.vercel.app/")
        )
    }

    @Test
    fun normalizeBaseUrl_normalizesEmulatorServer() {
        assertEquals(
            "http://10.0.2.2:5000/api/",
            ApiClient.normalizeBaseUrl("10.0.2.2:5000")
        )
    }

    @Test
    fun normalizeBaseUrl_doesNotDuplicateApiPath() {
        assertEquals(
            "http://192.168.1.20:5000/api/",
            ApiClient.normalizeBaseUrl("http://192.168.1.20:5000/api/")
        )
    }
}
