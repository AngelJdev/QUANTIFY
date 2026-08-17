package com.quantify.smartwatch.data.repository

import com.quantify.smartwatch.data.local.dao.HabitDao
import com.quantify.smartwatch.data.local.entity.CachedHabitEntity
import com.quantify.smartwatch.data.remote.RetrofitClient
import kotlinx.coroutines.flow.Flow

/**
 * Repository for habits — implements offline-first pattern.
 * Reads from local Room cache, refreshes from backend when online.
 *
 * Data flow:
 * UI ← Flow<List<CachedHabitEntity>> ← Room
 * Room ← refreshFromRemote() ← GET /api/habits
 */
class HabitRepository(private val habitDao: HabitDao) {

    private val api = RetrofitClient.apiService

    /**
     * Observable list of active habits from local cache.
     * UI subscribes to this Flow for reactive updates.
     */
    fun getActiveHabits(): Flow<List<CachedHabitEntity>> = habitDao.getActiveHabits()

    suspend fun getHabitById(id: Int): CachedHabitEntity? = habitDao.getHabitById(id)

    suspend fun getActiveCount(): Int = habitDao.getActiveCount()

    suspend fun getCompletedTodayCount(): Int = habitDao.getCompletedTodayCount()

    /**
     * Fetch habits from backend and update local cache.
     * Called during sync and initial pairing.
     */
    suspend fun refreshFromRemote(): Result<Unit> {
        return try {
            // Prefer dashboard endpoint (includes completado_hoy status)
            val dashResponse = api.getDashboard()
            if (dashResponse.isSuccessful && dashResponse.body()?.success == true) {
                val data = dashResponse.body()!!.data
                if (data != null && data.habits.isNotEmpty()) {
                    val entities = data.habits
                        .filter { it.activo }
                        .map { dto ->
                            CachedHabitEntity(
                                id = dto.id,
                                usuario_id = dto.usuario_id,
                                nombre = dto.nombre,
                                descripcion = dto.descripcion,
                                tipo_medicion = dto.tipo_medicion,
                                meta_diaria = dto.meta_diaria,
                                unidad = dto.unidad,
                                frecuencia = dto.frecuencia,
                                activo = dto.activo,
                                completado_hoy = dto.completado_hoy,
                                valor_hoy = dto.valor_hoy
                            )
                        }
                    habitDao.clearAll()
                    habitDao.insertAll(entities)
                    return Result.success(Unit)
                }
            }

            // Fallback: use GET /api/habits (no completado_hoy info)
            val response = api.getHabits()
            if (response.isSuccessful && response.body()?.success == true) {
                val habits = response.body()!!.data ?: emptyList()
                val entities = habits
                    .filter { it.activo }
                    .map { dto ->
                        CachedHabitEntity(
                            id = dto.id,
                            usuario_id = dto.usuario_id,
                            nombre = dto.nombre,
                            descripcion = dto.descripcion,
                            tipo_medicion = dto.tipo_medicion,
                            meta_diaria = dto.meta_diaria,
                            unidad = dto.unidad,
                            frecuencia = dto.frecuencia,
                            activo = dto.activo
                        )
                    }
                habitDao.clearAll()
                habitDao.insertAll(entities)
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.body()?.message ?: "Failed to fetch habits"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Mark a habit as completed locally (instant UI feedback).
     * The actual sync to backend happens via ActionQueue → SyncWorker.
     */
    suspend fun markCompletedLocally(habitId: Int, value: Double? = null) {
        habitDao.markCompleted(habitId, completed = true, value = value)
    }

    suspend fun resetDaily() = habitDao.resetAllDaily()

    suspend fun clearAll() = habitDao.clearAll()
}
