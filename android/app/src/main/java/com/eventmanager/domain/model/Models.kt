package com.eventmanager.domain.model

data class Event(
    val id: String?,
    val title: String?,
    val description: String?,
    val location: String?,
    val startDatetime: String?,
    val endDatetime: String?,
    val status: String?,
    val ticketTypes: List<TicketType?>?
)

data class TicketType(
    val id: String?,
    val eventId: String?,
    val name: String?,
    val price: String?,
    val maxCapacity: Int?,
    val registeredCount: Int?,
    val status: String? = null
) {
    val availableCapacity: Int get() = (maxCapacity ?: 0) - (registeredCount ?: 0)
    val isSoldOut: Boolean get() = status == "sold_out" || availableCapacity <= 0
}

data class Registration(
    val id: String?,
    val ticketTypeId: String?,
    val qrToken: String?,
    val status: String?,
    val registeredAt: String?,
    val eventId: String?,
    val eventTitle: String?,
    val ticketTypeName: String?,
    val reminderEnabled: Boolean = true
)
