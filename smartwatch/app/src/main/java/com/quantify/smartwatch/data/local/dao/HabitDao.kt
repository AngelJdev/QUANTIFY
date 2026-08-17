package com.quantify.smartwatch.data.local.dao

import androidx.room.*
import com.quantify.smartwatch.data.local.entity.CachedHabitEntity
import kotlinx.coroutines.flow.Flow

/**
 * DAO for cached habits. Provides reactive Flow for UI observation
 * and bulk operations for sync refresh.
 */
@Dao
interface HabitDao {

    @Query("SELECT * FROM cached_habits WHERE activo = 1 ORDER BY nombre ASC")
    fun getActiveHabits(): Flow<List<CachedHabitEntity>>

    @Query("SELECT * FROM cached_habits WHERE id = :habitId")
    suspend fun getHabitById(habitId: Int): CachedHabitEntity?

    @Query("SELECT COUNT(*) FROM cached_habits WHERE activo = 1")
    suspend fun getActiveCount(): Int

    @Query("SELECT COUNT(*) FROM cached_habits WHERE activo = 1 AND completado_hoy = 1")
    suspend fun getCompletedTodayCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(habits: List<CachedHabitEntity>)

    @Update
    suspend fun update(habit: CachedHabitEntity)

    @Query("UPDATE cached_habits SET completado_hoy = :completed, valor_hoy = :value WHERE id = :habitId")
    suspend fun markCompleted(habitId: Int, completed: Boolean, value: Double?)

    @Query("UPDATE cached_habits SET completado_hoy = 0, valor_hoy = NULL")
    suspend fun resetAllDaily()

    @Query("DELETE FROM cached_habits")
    suspend fun clearAll()
}
