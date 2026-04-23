package com.eventmanager.presentation.ticket

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.eventmanager.data.repository.RegistrationRepository
import com.eventmanager.domain.model.Registration
import com.eventmanager.domain.usecase.RegisterForEventUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject
import com.eventmanager.data.notification.ReminderScheduler

@HiltViewModel
class TicketDetailViewModel @Inject constructor(
    private val registrationRepository: RegistrationRepository,
    private val reminderScheduler: ReminderScheduler
) : ViewModel() {
    private val _registration = MutableStateFlow<Registration?>(null)
    val registration: StateFlow<Registration?> = _registration

    fun load(registrationId: String) {
        viewModelScope.launch {
            _registration.value = registrationRepository.observeMyRegistrations()
                .first().find { it.id == registrationId }
        }
    }

    fun toggleReminder(enabled: Boolean) {
        val reg = _registration.value ?: return
        val regId = reg.id ?: return
        viewModelScope.launch {
            registrationRepository.setReminderEnabled(regId, enabled)
            _registration.value = reg.copy(reminderEnabled = enabled)
            if (!enabled) {
                reminderScheduler.cancel(regId)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TicketDetailScreen(
    registrationId: String,
    onBack: () -> Unit,
    viewModel: TicketDetailViewModel = hiltViewModel(),
    qrCodeGenerator: QrCodeGenerator = QrCodeGenerator()
) {
    val registration by viewModel.registration.collectAsState()

    LaunchedEffect(registrationId) { viewModel.load(registrationId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ticket") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        registration?.let { reg ->
            Column(
                modifier = Modifier.padding(padding).padding(24.dp).fillMaxSize(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(reg.eventTitle ?: "", style = MaterialTheme.typography.headlineMedium)
                Spacer(Modifier.height(8.dp))
                Text(reg.ticketTypeName ?: "", style = MaterialTheme.typography.bodyLarge)
                Spacer(Modifier.height(4.dp))
                Badge(
                    containerColor = if (reg.status == "active")
                        MaterialTheme.colorScheme.primary
                    else MaterialTheme.colorScheme.secondary
                ) { Text(reg.status?.uppercase() ?: "") }

                Spacer(Modifier.height(24.dp))

                // QR Code displayed from cached qrToken (works offline)
                val qrBitmap = remember(reg.qrToken) {
                    qrCodeGenerator.generate(reg.qrToken ?: "", size = 400)
                }
                Image(
                    bitmap = qrBitmap.asImageBitmap(),
                    contentDescription = "QR Ticket",
                    modifier = Modifier.size(280.dp)
                )

                Spacer(Modifier.height(24.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Event Reminder", modifier = Modifier.weight(1f))
                    Switch(
                        checked = reg.reminderEnabled,
                        onCheckedChange = { viewModel.toggleReminder(it) },
                        enabled = reg.status == "active"
                    )
                }
            }
        } ?: Box(modifier = Modifier.padding(padding).fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator()
        }
    }
}
