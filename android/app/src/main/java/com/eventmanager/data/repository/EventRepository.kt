package com.eventmanager.data.repository

import com.eventmanager.data.local.EventDao
import com.eventmanager.data.local.EventEntity
import com.eventmanager.data.local.TicketTypeDao
import com.eventmanager.data.local.TicketTypeEntity
import com.eventmanager.data.remote.EventApiService
import com.eventmanager.data.remote.toDomain
import com.eventmanager.domain.model.Event
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class EventRepository @Inject constructor(
    private val eventApiService: EventApiService,
    private val eventDao: EventDao,
    private val ticketTypeDao: TicketTypeDao
) {
    fun observeEvents(): Flow<List<Event>> {
        return eventDao.observeAll().map { entities ->
            entities.map { entity ->
                val ticketTypes = ticketTypeDao.findByEventId(entity.id)
                entity.toDomain(ticketTypes)
            }
        }
    }

    suspend fun fetchAndCacheEvents(): Result<List<Event>> {
        return try {
            val response = eventApiService.getEvents()
            val events = response.data.map { it.toDomain() }

            eventDao.deleteAll()
            eventDao.insertAll(events.map { it.toEntity() })
            events.forEach { event ->
                val eventId = event.id ?: return@forEach
                ticketTypeDao.deleteByEventId(eventId)
                val ticketTypeEntities = event.ticketTypes?.filterNotNull()?.map {
                    it.toEntity(eventId)
                } ?: emptyList()
                ticketTypeDao.insertAll(ticketTypeEntities)
            }

            Result.success(events)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getEventById(id: String): Event? {
        val entity = eventDao.findById(id) ?: return null
        val ticketTypes = ticketTypeDao.findByEventId(id)
        return entity.toDomain(ticketTypes)
    }
}

private fun EventEntity.toDomain(ticketTypeEntities: List<com.eventmanager.data.local.TicketTypeEntity>) =
    Event(
        id = id,
        title = title,
        description = description,
        location = location,
        startDatetime = startDatetime.toString(),
        endDatetime = endDatetime.toString(),
        status = status,
        ticketTypes = ticketTypeEntities.map { tt ->
            com.eventmanager.domain.model.TicketType(
                id = tt.id,
                eventId = tt.eventId,
                name = tt.name,
                price = tt.price,
                maxCapacity = tt.maxCapacity,
                registeredCount = tt.registeredCount
            )
        }
    )

private fun Event.toEntity() = EventEntity(
    id = id ?: "",
    title = title ?: "",
    description = description,
    location = location ?: "",
    startDatetime = startDatetime?.let { try { Instant.parse(it) } catch (e: Exception) { null } } ?: Instant.now(),
    endDatetime = endDatetime?.let { try { Instant.parse(it) } catch (e: Exception) { null } } ?: Instant.now(),
    status = status ?: ""
)

private fun com.eventmanager.domain.model.TicketType.toEntity(eventId: String) = TicketTypeEntity(
    id = id ?: "",
    eventId = eventId,
    name = name ?: "",
    price = price ?: "",
    maxCapacity = maxCapacity ?: 0,
    registeredCount = registeredCount ?: 0
)
