package com.eventmanager.domain.usecase

import com.eventmanager.data.repository.EventRepository
import com.eventmanager.domain.model.Event
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetEventsUseCase @Inject constructor(
    private val eventRepository: EventRepository
) {
    operator fun invoke(): Flow<List<Event>> = eventRepository.observeEvents()
    suspend fun refresh(): Result<List<Event>> = eventRepository.fetchAndCacheEvents().apply {  }
}

class GetEventDetailUseCase @Inject constructor(
    private val eventRepository: EventRepository
) {
    suspend operator fun invoke(eventId: String): Event? = eventRepository.getEventById(eventId)
}
