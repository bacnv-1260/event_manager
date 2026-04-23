package com.eventmanager.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.time.Instant

@Entity(tableName = "events")
data class EventEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String?,
    val location: String,
    val startDatetime: Instant,
    val endDatetime: Instant,
    val status: String,
    val cachedAt: Instant = Instant.now()
)

@Entity(tableName = "ticket_types")
data class TicketTypeEntity(
    @PrimaryKey val id: String,
    val eventId: String,
    val name: String,
    val price: String,
    val maxCapacity: Int,
    val registeredCount: Int
)

@Entity(tableName = "registrations")
data class RegistrationEntity(
    @PrimaryKey val id: String,
    val ticketTypeId: String,
    val qrToken: String,
    val status: String,
    val registeredAt: Instant,
    val eventId: String,
    val eventTitle: String,
    val ticketTypeName: String,
    val reminderEnabled: Boolean = true
)
