import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

const LoginPage = lazy(() => import('../pages/LoginPage'));
const EventsPage = lazy(() => import('../pages/EventsPage'));
const CreateEditEventPage = lazy(() => import('../pages/CreateEditEventPage'));
const CheckInPage = lazy(() => import('../pages/CheckInPage'));
const AttendeeListPage = lazy(() => import('../pages/AttendeeListPage'));

function LoadingFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
      Loading...
    </div>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Organizer only */}
          <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/new" element={<CreateEditEventPage />} />
            <Route path="/events/:id/edit" element={<CreateEditEventPage />} />
            <Route path="/events/:id/attendees" element={<AttendeeListPage />} />
          </Route>

          {/* Organizer + check-in operator */}
          <Route element={<ProtectedRoute allowedRoles={['organizer', 'checkin_operator']} />}>
            <Route path="/checkin" element={<CheckInPage />} />
          </Route>

          <Route path="/unauthorized" element={<div>Unauthorized</div>} />
          <Route path="/" element={<Navigate to="/events" replace />} />
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
