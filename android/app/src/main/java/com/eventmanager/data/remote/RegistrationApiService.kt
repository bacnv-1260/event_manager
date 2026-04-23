package com.eventmanager.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

data class RegisterForEventRequest(val ticketTypeId: String)

data class RegistrationResponse(
    val registration: RegistrationDto?,
)

data class RegistrationDto(
    val id: String?,
    val ticketTypeId: String?,
    val qrToken: String?,
    val status: String?,
    val registeredAt: String?,
    val eventTitle: String?,
)

interface RegistrationApiService {
    @POST("registrations")
    suspend fun register(@Body request: RegisterForEventRequest): ApiItemResponse<RegistrationDto>

    @GET("registrations/me")
    suspend fun getMyRegistrations(): ApiListResponse<RegistrationDto>
}
