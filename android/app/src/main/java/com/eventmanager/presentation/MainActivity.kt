package com.eventmanager.presentation

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.eventmanager.data.repository.UserRepository
import com.eventmanager.presentation.auth.LoginScreen
import com.eventmanager.presentation.auth.SignUpScreen
import com.eventmanager.presentation.events.EventDetailScreen
import com.eventmanager.presentation.events.EventListScreen
import com.eventmanager.presentation.registration.RegistrationConfirmScreen
import com.eventmanager.presentation.ticket.MyTicketsScreen
import com.eventmanager.presentation.ticket.TicketDetailScreen
import dagger.hilt.android.AndroidEntryPoint
import javax.inject.Inject

@AndroidEntryPoint
class MainActivity : ComponentActivity() {

    @Inject
    lateinit var userRepository: UserRepository

    private val notificationPermissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { _ -> }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request notification permission on Android 13+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            notificationPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
        }

        val startDestination = if (userRepository.isLoggedIn()) "events" else "login"

        setContent {
            MaterialTheme {
                Surface {
                    val navController = rememberNavController()

                    NavHost(
                        navController = navController,
                        startDestination = startDestination
                    ) {
                        composable("login") {
                            LoginScreen(
                                onLoginSuccess = {
                                    navController.navigate("events") {
                                        popUpTo("login") { inclusive = true }
                                    }
                                },
                                onNavigateToSignUp = { navController.navigate("signup") }
                            )
                        }
                        composable("signup") {
                            SignUpScreen(
                                onSignUpSuccess = {
                                    navController.navigate("events") {
                                        popUpTo("login") { inclusive = true }
                                    }
                                },
                                onNavigateToLogin = { navController.popBackStack() }
                            )
                        }
                        composable("events") {
                            EventListScreen(
                                onEventClick = { eventId ->
                                    navController.navigate("events/$eventId")
                                },
                                onMyTicketsClick = { navController.navigate("my-tickets") }
                            )
                        }
                        composable("events/{eventId}") { backStackEntry ->
                            val eventId = backStackEntry.arguments?.getString("eventId") ?: return@composable
                            EventDetailScreen(
                                eventId = eventId,
                                onRegisterClick = { ticketTypeId ->
                                    navController.navigate("register/$eventId/$ticketTypeId")
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("register/{eventId}/{ticketTypeId}") { backStackEntry ->
                            val eventId = backStackEntry.arguments?.getString("eventId") ?: return@composable
                            val ticketTypeId = backStackEntry.arguments?.getString("ticketTypeId") ?: return@composable
                            RegistrationConfirmScreen(
                                eventId = eventId,
                                ticketTypeId = ticketTypeId,
                                onConfirmed = {
                                    navController.navigate("my-tickets") {
                                        popUpTo("events") { inclusive = false }
                                    }
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("my-tickets") {
                            MyTicketsScreen(
                                onTicketClick = { registrationId ->
                                    navController.navigate("ticket/$registrationId")
                                },
                                onBack = { navController.popBackStack() }
                            )
                        }
                        composable("ticket/{registrationId}") { backStackEntry ->
                            val registrationId = backStackEntry.arguments?.getString("registrationId") ?: return@composable
                            TicketDetailScreen(
                                registrationId = registrationId,
                                onBack = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}
