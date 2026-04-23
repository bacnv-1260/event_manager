package com.eventmanager.presentation.registration

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.eventmanager.domain.model.Event
import com.eventmanager.domain.usecase.GetEventDetailUseCase
import com.eventmanager.domain.usecase.RegisterForEventUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

sealed class RegistrationUiState {
    object Idle : RegistrationUiState()
    object Loading : RegistrationUiState()
    object Success : RegistrationUiState()
    data class Error(val message: String) : RegistrationUiState()
}

@HiltViewModel
class RegistrationViewModel @Inject constructor(
    private val getEventDetailUseCase: GetEventDetailUseCase,
    private val registerForEventUseCase: RegisterForEventUseCase
) : ViewModel() {
    private val _event = MutableStateFlow<Event?>(null)
    val event: StateFlow<Event?> = _event

    private val _uiState = MutableStateFlow<RegistrationUiState>(RegistrationUiState.Idle)
    val uiState: StateFlow<RegistrationUiState> = _uiState

    fun loadEvent(eventId: String) {
        viewModelScope.launch { _event.value = getEventDetailUseCase(eventId) }
    }

    fun register(ticketTypeId: String) {
        val ev = _event.value ?: return
        val tt = ev.ticketTypes?.filterNotNull()?.find { it.id == ticketTypeId } ?: return
        viewModelScope.launch {
            _uiState.value = RegistrationUiState.Loading
            try {
                registerForEventUseCase(
                    ticketTypeId = ticketTypeId,
                    eventStartDatetime = ev.startDatetime ?: "",
                    eventTitle = ev.title ?: ""
                )
                _uiState.value = RegistrationUiState.Success
            } catch (e: Exception) {
                e.printStackTrace()
                _uiState.value = RegistrationUiState.Error(e.message ?: "Registration failed")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegistrationConfirmScreen(
    eventId: String,
    ticketTypeId: String,
    onConfirmed: () -> Unit,
    onBack: () -> Unit,
    viewModel: RegistrationViewModel = hiltViewModel()
) {
    val event by viewModel.event.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(eventId) { viewModel.loadEvent(eventId) }
    LaunchedEffect(uiState) {
        if (uiState is RegistrationUiState.Success) onConfirmed()
    }

    val ticketType = event?.ticketTypes?.filterNotNull()?.find { it.id == ticketTypeId }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Confirm Registration") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier.padding(padding).padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            event?.let { ev ->
                Text(ev.title ?: "", style = MaterialTheme.typography.headlineSmall)
                ticketType?.let { tt ->
                    Text("Ticket: ${tt.name ?: ""}")
                    Text("Price: ${if (tt.price == "0.00") "Free" else "$${tt.price ?: ""}"}")
                }
            } ?: CircularProgressIndicator()

            if (uiState is RegistrationUiState.Error) {
                Text(
                    (uiState as RegistrationUiState.Error).message,
                    color = MaterialTheme.colorScheme.error
                )
            }

            Button(
                onClick = { viewModel.register(ticketTypeId) },
                enabled = event != null && uiState !is RegistrationUiState.Loading,
                modifier = Modifier.fillMaxWidth()
            ) {
                if (uiState is RegistrationUiState.Loading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp))
                } else {
                    Text("Confirm Registration")
                }
            }
        }
    }
}
