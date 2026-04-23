package com.eventmanager.data.remote

import com.eventmanager.domain.model.UserProfile
import retrofit2.http.Body
import retrofit2.http.POST

data class LoginRequest(val email: String, val password: String)
data class RegisterRequest(val name: String, val email: String, val password: String)
data class RefreshRequest(val refreshToken: String)
data class AuthResponse(
    val user: UserProfile,
    val accessToken: String,
    val refreshToken: String
)
data class RefreshResponse(val accessToken: String, val refreshToken: String?)

interface AuthApiService {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): AuthResponse

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): AuthResponse

    @POST("auth/refresh")
    suspend fun refresh(@Body request: RefreshRequest): RefreshResponse

    @POST("auth/logout")
    suspend fun logout()
}
