package com.eventmanager.di

import android.content.Context
import androidx.room.Room
import com.eventmanager.data.local.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "event_manager.db"
        ).build()
    }

    @Provides
    fun provideEventDao(db: AppDatabase): EventDao = db.eventDao()

    @Provides
    fun provideTicketTypeDao(db: AppDatabase): TicketTypeDao = db.ticketTypeDao()

    @Provides
    fun provideRegistrationDao(db: AppDatabase): RegistrationDao = db.registrationDao()
}
