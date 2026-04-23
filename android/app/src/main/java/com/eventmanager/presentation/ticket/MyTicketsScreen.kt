package com.eventmanager.presentation.ticket

import androidx.compose.foundation.Image
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
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
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

@HiltViewModel
class MyTicketsViewModel @Inject constructor(
    private val registrationRepository: RegistrationRepository
) : ViewModel() {
    val registrations: StateFlow<List<Registration>> = registrationRepository.observeMyRegistrations()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MyTicketsScreen(
    onTicketClick: (String) -> Unit,
    onBack: () -> Unit,
    viewModel: MyTicketsViewModel = hiltViewModel()
) {
    val registrations by viewModel.registrations.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Tickets") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, "Back")
                    }
                }
            )
        }
    ) { padding ->
        if (registrations.isEmpty()) {
            Box(modifier = Modifier.padding(padding).fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("No tickets yet")
            }
        } else {
            LazyColumn(modifier = Modifier.padding(padding)) {
                items(registrations) { reg ->
                    ListItem(
                        headlineContent = { Text(reg.eventTitle ?: "") },
                        supportingContent = { Text(reg.ticketTypeName ?: "") },
                        trailingContent = {
                            Badge(
                                containerColor = if (reg.status == "used")
                                    MaterialTheme.colorScheme.secondary
                                else MaterialTheme.colorScheme.primary
                            ) { Text(reg.status ?: "") }
                        },
                        modifier = Modifier.clickable { reg.id?.let { onTicketClick(it) } }
                    )
                    HorizontalDivider()
                }
            }
        }
    }
}
