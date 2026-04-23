package com.eventmanager.data.notification

import android.content.Context
import androidx.work.*
import dagger.hilt.android.qualifiers.ApplicationContext
import java.time.Instant
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ReminderScheduler @Inject constructor(
    @ApplicationContext private val context: Context
) {
    fun schedule(registrationId: String, eventTitle: String, eventStartDatetime: String) {
        val eventStart = Instant.parse(eventStartDatetime)
        val now = Instant.now()

        val twentyFourHoursBefore = eventStart.minusSeconds(24 * 60 * 60)
        val oneHourBefore = eventStart.minusSeconds(60 * 60)

        val workManager = WorkManager.getInstance(context)

        // T-24h reminder
        val delay24h = twentyFourHoursBefore.epochSecond - now.epochSecond
        if (delay24h > 0) {
            val request24h = OneTimeWorkRequestBuilder<ReminderWorker>()
                .setInitialDelay(delay24h, TimeUnit.SECONDS)
                .setInputData(
                    workDataOf(
                        ReminderWorker.KEY_EVENT_TITLE to eventTitle,
                        ReminderWorker.KEY_REMINDER_TYPE to "24h"
                    )
                )
                .addTag("reminder_${registrationId}_24h")
                .build()
            workManager.enqueue(request24h)
        }

        // T-1h reminder
        val delay1h = oneHourBefore.epochSecond - now.epochSecond
        if (delay1h > 0) {
            val request1h = OneTimeWorkRequestBuilder<ReminderWorker>()
                .setInitialDelay(delay1h, TimeUnit.SECONDS)
                .setInputData(
                    workDataOf(
                        ReminderWorker.KEY_EVENT_TITLE to eventTitle,
                        ReminderWorker.KEY_REMINDER_TYPE to "1h"
                    )
                )
                .addTag("reminder_${registrationId}_1h")
                .build()
            workManager.enqueue(request1h)
        }
    }

    fun cancel(registrationId: String) {
        val workManager = WorkManager.getInstance(context)
        workManager.cancelAllWorkByTag("reminder_${registrationId}_24h")
        workManager.cancelAllWorkByTag("reminder_${registrationId}_1h")
    }
}
