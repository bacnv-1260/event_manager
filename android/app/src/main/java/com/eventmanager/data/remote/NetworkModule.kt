package com.eventmanager.data.remote

import com.eventmanager.BuildConfig
import com.eventmanager.data.security.KeystoreTokenStore
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(tokenStore: KeystoreTokenStore): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        return OkHttpClient.Builder()
            .addInterceptor { chain ->
                val token = tokenStore.getAccessToken()
                val request = if (token != null) {
                    chain.request().newBuilder()
                        .addHeader("Authorization", "Bearer $token")
                        .build()
                } else {
                    chain.request()
                }
                val response = chain.proceed(request)

                // 401 handling: attempt token refresh
                if (response.code == 401) {
                    response.close()
                    val refreshToken = tokenStore.getRefreshToken()
                    if (refreshToken != null) {
                        try {
                            val refreshClient = OkHttpClient()
                            val refreshRequest = okhttp3.Request.Builder()
                                .url("${BuildConfig.BASE_URL}auth/refresh")
                                .post(
                                    okhttp3.RequestBody.create(
                                        "application/json".toMediaTypeOrNull(),
                                        """{"refreshToken":"$refreshToken"}"""
                                    )
                                )
                                .build()
                            val refreshResponse = refreshClient.newCall(refreshRequest).execute()
                            if (refreshResponse.isSuccessful) {
                                val body = refreshResponse.body?.string()
                                val newToken = body?.let {
                                    org.json.JSONObject(it).getString("accessToken")
                                }
                                if (newToken != null) {
                                    tokenStore.storeAccessToken(newToken)
                                    val newRequest = chain.request().newBuilder()
                                        .header("Authorization", "Bearer $newToken")
                                        .build()
                                    return@addInterceptor chain.proceed(newRequest)
                                }
                            }
                            refreshResponse.close()
                        } catch (_: Exception) {
                        }
                    }
                    tokenStore.clearTokens()
                }
                response
            }
            .addInterceptor(loggingInterceptor)
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
}
