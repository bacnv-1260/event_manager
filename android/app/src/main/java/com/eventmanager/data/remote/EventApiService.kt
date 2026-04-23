package com.eventmanager.data.remote

import com.eventmanager.domain.model.Event
import com.eventmanager.domain.model.TicketType
import retrofit2.http.GET
import retrofit2.http.Path

data class ApiListResponse<T>(val data: List<T>)
data class ApiItemResponse<T>(val data: T)

data class EventDto(
    val id: String,
    val title: String,
    val description: String?,
    val location: String,
    val startDatetime: String,
    val endDatetime: String,
    val status: String,
    val ticketTypes: List<TicketTypeDto>
)

data class TicketTypeDto(
    val id: String,
    val name: String,
    val price: String,
    val maxCapacity: Int,
    val registeredCount: Int
)

fun EventDto.toDomain() = Event(
    id = id,
    title = title,
    description = description,
    location = location,
    startDatetime = startDatetime,
    endDatetime = endDatetime,
    status = status,
    ticketTypes = ticketTypes.map { it.toDomain() }
)

fun TicketTypeDto.toDomain() = TicketType(
    id = id,
    eventId = "",
    name = name,
    price = price,
    maxCapacity = maxCapacity,
    registeredCount = registeredCount
)

interface EventApiService {
    @GET("events")
    suspend fun getEvents(): ApiListResponse<EventDto>

    @GET("events/{id}")
    suspend fun getEventById(@Path("id") id: String): ApiItemResponse<EventDto>
}
