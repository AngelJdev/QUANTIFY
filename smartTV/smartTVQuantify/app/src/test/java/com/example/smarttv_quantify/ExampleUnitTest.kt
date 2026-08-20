package com.example.smarttv_quantify

import com.example.smarttv_quantify.data.remote.ApiClient
import com.example.smarttv_quantify.data.remote.dto.AchievementsData
import com.example.smarttv_quantify.data.remote.dto.FlexibleDoubleJsonAdapter
import com.example.smarttv_quantify.data.remote.dto.HabitDto
import com.example.smarttv_quantify.data.remote.dto.PairRequestData
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import org.junit.Test
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue

class ApiClientTest {
    private val moshi = Moshi.Builder()
        .add(FlexibleDoubleJsonAdapter())
        .add(KotlinJsonAdapterFactory())
        .build()

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

    @Test
    fun pairingResponse_readsBackendExpirationField() {
        val data = moshi.adapter(PairRequestData::class.java)
            .fromJson("""{"code":"ABC123","expires_in":180}""")

        assertEquals("ABC123", data?.code)
        assertEquals(180, data?.expiresIn)
    }

    @Test
    fun habitResponse_acceptsDecimalAsString() {
        val habit = moshi.adapter(HabitDto::class.java)
            .fromJson("""{"id":1,"nombre":"Leer","meta_diaria":"12.50"}""")

        assertEquals(12.5, habit?.meta_diaria ?: 0.0, 0.001)
    }

    @Test
    fun achievementsResponse_readsCompleteCatalog() {
        val payload = """
            {
              "catalog": [{
                "id": "pionero_quantify",
                "titulo": "Pionero",
                "descripcion": "Primer hábito",
                "requisito": "Crear un hábito",
                "categoria": "Plataforma",
                "rareza": "Común",
                "icono": "🌟",
                "unlocked": true
              }],
              "unlockedCount": 1,
              "totalCatalogCount": 25
            }
        """.trimIndent()
        val achievements = moshi.adapter(AchievementsData::class.java).fromJson(payload)

        assertEquals(25, achievements?.totalCatalogCount)
        assertEquals(1, achievements?.unlockedCount)
        assertTrue(achievements?.catalog?.first()?.unlocked == true)
    }
}
