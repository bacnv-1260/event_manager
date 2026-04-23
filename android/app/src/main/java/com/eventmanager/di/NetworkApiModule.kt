package com.eventmanager.di

import com.eventmanager.data.remote.AuthApiService
import com.eventmanager.data.remote.EventApiService
import com.eventmanager.data.remote.RegistrationApiService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkApiModule {

    @Provides
    @Singleton
    fun provideAuthApiService(retrofit: Retrofit): AuthApiService =
        retrofit.create(AuthApiService::class.java)

    @Provides
    @Singleton
    fun provideEventApiService(retrofit: Retrofit): EventApiService =
        retrofit.create(EventApiService::class.java)

    @Provides
    @Singleton
    fun provideRegistrationApiService(retrofit: Retrofit): RegistrationApiService =
        retrofit.create(RegistrationApiService::class.java)
}
