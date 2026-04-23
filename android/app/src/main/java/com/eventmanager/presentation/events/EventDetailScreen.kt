package com.eventmanager.presentation.events

import android.util.Log
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.eventmanager.domain.model.Event
import com.eventmanager.domain.usecase.GetEventDetailUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class EventDetailViewModel @Inject constructor(
    private val getEventDetailUseCase: GetEventDetailUseCase
) : ViewModel() {
    private val _event = MutableStateFlow<Event?>(null)
    val event: StateFlow<Event?> = _event

    fun load(eventId: String) {
        viewModelScope.launch {
            _event.value = getEventDetailUseCase(eventId)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventDetailScreen(
    eventId: String,
    onRegisterClick: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: EventDetailViewModel = hiltViewModel()
) {
    val event by viewModel.event.collectAsState()

    LaunchedEffect(eventId) { viewModel.load(eventId) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(event?.title ?: "Event") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { padding ->
        event?.let { ev ->
            LazyColumn(modifier = Modifier.padding(padding).padding(16.dp)) {
                item {
                    Text(ev.title ?: "", style = MaterialTheme.typography.headlineMedium)
                    Spacer(Modifier.height(8.dp))
                    ev.description?.let { Text(it) }
                    Spacer(Modifier.height(8.dp))
                    Text("📍 ${ev.location ?: ""}")
                    Spacer(Modifier.height(16.dp))
                    Text("Ticket Types", style = MaterialTheme.typography.titleMedium)
                    Spacer(Modifier.height(8.dp))
                }
                val ticketTypes = ev.ticketTypes?.filterNotNull() ?: emptyList()
                items(ticketTypes) { tt ->
                    Log.e("==================", "isSoldOut: ${tt.isSoldOut} -- status: ${ev.status}")
                    Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                        Row(
                            modifier = Modifier.padding(12.dp),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(tt.name ?: "", style = MaterialTheme.typography.bodyLarge)
                                Text(
                                    if (tt.price == "0.00" || tt.price == "0") "Free" else "$${ tt.price ?: ""}",
                                    style = MaterialTheme.typography.bodySmall
                                )
                                Text("${tt.availableCapacity} spots left", style = MaterialTheme.typography.bodySmall)
                            }
                            Button(
                                onClick = { tt.id?.let { onRegisterClick(it) } },
                                enabled = !tt.isSoldOut && ev.status == "published"
                            ) {
                                Text(if (tt.isSoldOut) "Sold Out" else "Register")
                            }
                        }
                    }
                }
            }
        } ?: Box(modifier = Modifier.padding(padding).padding(16.dp)) {
            CircularProgressIndicator()
        }
    }
}
