package com.eventmanager.presentation.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

// Loading skeleton shimmer box
@Composable
fun SkeletonBox(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(4.dp))
            .background(Color.LightGray.copy(alpha = 0.4f))
    )
}

// Event list loading skeleton
@Composable
fun EventListSkeleton() {
    Column(modifier = Modifier.padding(16.dp)) {
        repeat(4) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp)
            ) {
                SkeletonBox(modifier = Modifier.fillMaxWidth(0.7f).height(20.dp))
                Spacer(Modifier.height(6.dp))
                SkeletonBox(modifier = Modifier.fillMaxWidth(0.4f).height(14.dp))
                Spacer(Modifier.height(4.dp))
                SkeletonBox(modifier = Modifier.fillMaxWidth(0.3f).height(14.dp))
            }
        }
    }
}

// Ticket skeleton
@Composable
fun TicketSkeleton() {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        SkeletonBox(modifier = Modifier.fillMaxWidth(0.6f).height(28.dp))
        Spacer(Modifier.height(8.dp))
        SkeletonBox(modifier = Modifier.fillMaxWidth(0.4f).height(18.dp))
        Spacer(Modifier.height(24.dp))
        SkeletonBox(modifier = Modifier.size(280.dp))
    }
}

// Network error state
@Composable
fun ErrorState(message: String, onRetry: (() -> Unit)? = null) {
    Column(
        modifier = Modifier.fillMaxSize().padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("⚠️", style = MaterialTheme.typography.displaySmall)
        Spacer(Modifier.height(8.dp))
        Text(message, style = MaterialTheme.typography.bodyLarge)
        if (onRetry != null) {
            Spacer(Modifier.height(16.dp))
            TextButton(onClick = onRetry) { Text("Retry") }
        }
    }
}
