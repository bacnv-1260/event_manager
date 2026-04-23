package com.eventmanager.data.repository

import com.eventmanager.data.remote.AuthApiService
import com.eventmanager.data.remote.LoginRequest
import com.eventmanager.data.remote.RefreshRequest
import com.eventmanager.data.remote.RegisterRequest
import com.eventmanager.data.security.KeystoreTokenStore
import com.eventmanager.domain.model.UserProfile
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class UserRepository @Inject constructor(
    private val authApiService: AuthApiService,
    private val tokenStore: KeystoreTokenStore
) {
    suspend fun login(email: String, password: String): UserProfile {
        val response = authApiService.login(LoginRequest(email, password))
        tokenStore.storeAccessToken(response.accessToken)
        tokenStore.storeRefreshToken(response.refreshToken)
        return response.user
    }

    suspend fun register(name: String, email: String, password: String): UserProfile {
        val response = authApiService.register(RegisterRequest(name, email, password))
        tokenStore.storeAccessToken(response.accessToken)
        tokenStore.storeRefreshToken(response.refreshToken)
        return response.user
    }

    suspend fun refreshToken(): Boolean {
        val refreshToken = tokenStore.getRefreshToken() ?: return false
        return try {
            val response = authApiService.refresh(RefreshRequest(refreshToken))
            tokenStore.storeAccessToken(response.accessToken)
            response.refreshToken?.let { tokenStore.storeRefreshToken(it) }
            true
        } catch (e: Exception) {
            false
        }
    }

    fun clearSession() = tokenStore.clearTokens()

    fun isLoggedIn(): Boolean = tokenStore.getAccessToken() != null
}
