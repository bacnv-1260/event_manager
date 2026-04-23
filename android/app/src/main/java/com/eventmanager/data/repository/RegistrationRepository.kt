package com.eventmanager.data.repository

import com.eventmanager.data.local.RegistrationDao
import com.eventmanager.data.local.RegistrationEntity
import com.eventmanager.data.remote.RegisterForEventRequest
import com.eventmanager.data.remote.RegistrationApiService
import com.eventmanager.domain.model.Registration
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.time.Instant
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class RegistrationRepository @Inject constructor(
    private val registrationApiService: RegistrationApiService,
    private val registrationDao: RegistrationDao
) {
    fun observeMyRegistrations(): Flow<List<Registration>> {
        return registrationDao.observeAll().map { entities ->
            entities.map { it.toDomain() }
        }
    }

    suspend fun register(ticketTypeId: String): Registration {
        val response = registrationApiService.register(RegisterForEventRequest(ticketTypeId))
        val dto = response.data
        val entity = RegistrationEntity(
            id = dto.id ?: "",
            ticketTypeId = dto.ticketTypeId.orEmpty(),
            qrToken = dto.qrToken.orEmpty(),
            status = dto.status.orEmpty(),
            registeredAt = Instant.parse(dto.registeredAt),
            eventId = "",
            eventTitle = dto.eventTitle ?: "",
            ticketTypeName = "",
            reminderEnabled = true
        )
        registrationDao.insertAll(listOf(entity))
        return entity.toDomain()
    }

//    suspend fun fetchAndCacheMyRegistrations() {
//        val response = registrationApiService.getMyRegistrations()
//        val entities = response.data.map { dto ->
//            RegistrationEntity(
//                id = dto.id,
//                ticketTypeId = dto.ticketTypeId,
//                qrToken = dto.qrToken,
//                status = dto.status,
//                registeredAt = Instant.parse(dto.registeredAt),
//                eventId = dto.event?.id ?: "",
//                eventTitle = dto.event?.title ?: "",
//                ticketTypeName = dto.ticketType?.name ?: "",
//                reminderEnabled = true
//            )
//        }
//        registrationDao.insertAll(entities)
//    }

    suspend fun setReminderEnabled(registrationId: String, enabled: Boolean) {
        val entity = registrationDao.findById(registrationId) ?: return
        registrationDao.update(entity.copy(reminderEnabled = enabled))
    }
}

private fun RegistrationEntity.toDomain() = Registration(
    id = id,
    ticketTypeId = ticketTypeId,
    qrToken = qrToken,
    status = status,
    registeredAt = registeredAt.toString(),
    eventId = eventId,
    eventTitle = eventTitle,
    ticketTypeName = ticketTypeName,
    reminderEnabled = reminderEnabled
)
