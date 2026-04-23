package com.eventmanager.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface EventDao {
    @Query("SELECT * FROM events ORDER BY startDatetime ASC")
    fun observeAll(): Flow<List<EventEntity>>

    @Query("SELECT * FROM events WHERE id = :id")
    suspend fun findById(id: String): EventEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(events: List<EventEntity>)

    @Query("DELETE FROM events")
    suspend fun deleteAll()
}

@Dao
interface TicketTypeDao {
    @Query("SELECT * FROM ticket_types WHERE eventId = :eventId")
    suspend fun findByEventId(eventId: String): List<TicketTypeEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(ticketTypes: List<TicketTypeEntity>)

    @Query("DELETE FROM ticket_types WHERE eventId = :eventId")
    suspend fun deleteByEventId(eventId: String)
}

@Dao
interface RegistrationDao {
    @Query("SELECT * FROM registrations ORDER BY registeredAt DESC")
    fun observeAll(): Flow<List<RegistrationEntity>>

    @Query("SELECT * FROM registrations WHERE id = :id")
    suspend fun findById(id: String): RegistrationEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(registrations: List<RegistrationEntity>)

    @Update
    suspend fun update(registration: RegistrationEntity)
}
