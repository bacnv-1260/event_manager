package com.eventmanager.data.notification

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import androidx.core.app.NotificationCompat
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class ReminderWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters
) : CoroutineWorker(context, params) {

    companion object {
        const val CHANNEL_ID = "event_reminders"
        const val KEY_EVENT_TITLE = "event_title"
        const val KEY_REMINDER_TYPE = "reminder_type"
    }

    override suspend fun doWork(): Result {
        val eventTitle = inputData.getString(KEY_EVENT_TITLE) ?: return Result.failure()
        val reminderType = inputData.getString(KEY_REMINDER_TYPE) ?: "1h"

        createNotificationChannel()

        val notificationText = when (reminderType) {
            "24h" -> "Your event starts tomorrow: $eventTitle"
            else -> "Your event starts in 1 hour: $eventTitle"
        }

        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE)
            as NotificationManager

        val notification = NotificationCompat.Builder(applicationContext, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("Event Reminder")
            .setContentText(notificationText)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .build()

        manager.notify(System.currentTimeMillis().toInt(), notification)
        return Result.success()
    }

    private fun createNotificationChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Event Reminders",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Notifications for upcoming events"
        }
        val manager = applicationContext.getSystemService(Context.NOTIFICATION_SERVICE)
            as NotificationManager
        manager.createNotificationChannel(channel)
    }
}
