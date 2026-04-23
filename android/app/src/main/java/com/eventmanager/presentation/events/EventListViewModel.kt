package com.eventmanager.presentation.events

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.eventmanager.domain.model.Event
import com.eventmanager.domain.usecase.GetEventsUseCase
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.time.Instant
import javax.inject.Inject

sealed class EventListUiState {
    object Loading : EventListUiState()
    data class Success(val events: List<Event>, val lastUpdated: Instant?) : EventListUiState()
    data class Error(val message: String) : EventListUiState()
}


@HiltViewModel
class EventListViewModel @Inject constructor(
    private val getEventsUseCase: GetEventsUseCase
) : ViewModel() {

    private val _isRefreshing = MutableStateFlow(false)
    val isRefreshing: StateFlow<Boolean> = _isRefreshing

    private val _lastUpdated = MutableStateFlow<Instant?>(null)
    val lastUpdated: StateFlow<Instant?> = _lastUpdated

    val events: StateFlow<List<Event>> = getEventsUseCase()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun refresh() {
        viewModelScope.launch {
            _isRefreshing.value = true
            getEventsUseCase.refresh()
            _lastUpdated.value = Instant.now()
            _isRefreshing.value = false
        }
    }

    init {
        refresh()
    }
}
