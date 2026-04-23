package com.eventmanager.presentation.events

import android.util.Log
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.eventmanager.domain.model.Event
import com.eventmanager.presentation.components.ErrorState
import com.eventmanager.presentation.components.EventListSkeleton
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

private val formatter = DateTimeFormatter.ofPattern("MMM d, yyyy HH:mm").withZone(ZoneId.systemDefault())

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EventListScreen(
    onEventClick: (String) -> Unit,
    onMyTicketsClick: () -> Unit,
    viewModel: EventListViewModel = hiltViewModel()
) {
    val events by viewModel.events.collectAsState()
    val isRefreshing by viewModel.isRefreshing.collectAsState()
    val lastUpdated by viewModel.lastUpdated.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Events") },
                actions = {
                    TextButton(onClick = onMyTicketsClick) { Text("My Tickets") }
                }
            )
        }
    ) { padding ->
        PullToRefreshBox(
            isRefreshing = isRefreshing,
            onRefresh = { viewModel.refresh() },
            modifier = Modifier.padding(padding)
        ) {
            Log.e("=================", "$isRefreshing -- ${events.size}")
            if (!isRefreshing && events.isEmpty()) {
                EventListSkeleton()
            } else {
                LazyColumn(modifier = Modifier.fillMaxSize()) {
                    lastUpdated?.let { ts ->
                        item {
                            Text(
                                "Updated ${formatter.format(ts)}",
                                style = MaterialTheme.typography.labelSmall,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 4.dp)
                            )
                        }
                    }
                    items(events) { event ->
                        EventCard(event = event, onClick = { event.id?.let { onEventClick(it) } })
                    }
                }
            }
        }
    }
}

@Composable
private fun EventCard(event: Event, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable(onClick = onClick)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(event.title ?: "", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(4.dp))
            Text(event.location ?: "", style = MaterialTheme.typography.bodyMedium)
            event.startDatetime?.let {
                val dateText = try {
                    formatter.format(Instant.parse(it))
                } catch (e: Exception) {
                    "Invalid Date"
                }
                Text(
                    text = dateText,
                    style = MaterialTheme.typography.bodySmall
                )
            }
            val ticketTypes = event.ticketTypes?.filterNotNull() ?: emptyList()
            val totalCapacity = ticketTypes.sumOf { it.maxCapacity ?: 0 }
            val registered = ticketTypes.sumOf { it.registeredCount ?: 0 }
            if (totalCapacity > 0 && registered >= totalCapacity) {
                Spacer(Modifier.height(4.dp))
                Badge { Text("Sold Out") }
            }
        }
    }
}
