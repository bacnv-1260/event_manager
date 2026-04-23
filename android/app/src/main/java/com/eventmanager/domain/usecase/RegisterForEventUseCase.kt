package com.eventmanager.domain.usecase

import com.eventmanager.data.notification.ReminderScheduler
import com.eventmanager.data.repository.RegistrationRepository
import com.eventmanager.domain.model.Registration
import javax.inject.Inject

class RegisterForEventUseCase @Inject constructor(
    private val registrationRepository: RegistrationRepository,
    private val reminderScheduler: ReminderScheduler
) {
    suspend operator fun invoke(ticketTypeId: String, eventStartDatetime: String, eventTitle: String): Registration {
        val registration = registrationRepository.register(ticketTypeId)
        // Schedule reminders after successful registration
        registration.id?.let { registrationId ->
            reminderScheduler.schedule(
                registrationId = registrationId,
                eventTitle = eventTitle,
                eventStartDatetime = eventStartDatetime
            )
        }
        return registration
    }
}
