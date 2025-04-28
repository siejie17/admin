import React from 'react';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';

import AppLayout from "./layout/AppLayout";
import EventListingPage from "./pages/events/EventListingPage";
import EventCreationTabs from './pages/events/EventCreationTabs.jsx';
import EventManager from './pages/events/EventManager.jsx';
import MerchandiseListingPage from "./pages/merchandise/MerchandiseListingPage";

import LoginPage from './pages/auth/LoginPage';
import PasswordResetPage from "./pages/auth/PasswordResetPage";

import { useAuth } from './contexts/AuthContext.jsx';
import MerchandiseCreationPage from './pages/merchandise/MerchandiseCreationPage.jsx';
import MerchandiseTabs from './pages/merchandise/MerchandiseTabs.jsx';
import Loader from './components/General/Loader.jsx';
import AttendanceQR from './components/Events/Attendance/AttendanceQR.jsx';
import QuestDetails from './components/Events/Quest/QuestDetails.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  return (
    <Router>
      <Routes>
        {user ? (
          <>
            <Route element={<AppLayout />}>
              {/* Events Routes */}
              <Route path="/event" element={<EventListingPage />} />
              <Route path="/event/create-event" element={<EventCreationTabs />} />
              <Route path="/event/details" element={<EventManager />} />
              <Route path="/event/details/quest" element={<QuestDetails />} />

              {/* Merchandise Routes */}
              <Route path="/merchandise" element={<MerchandiseListingPage />} />
              <Route path="/merchandise/create-merchandise" element={<MerchandiseCreationPage />} />
              <Route path="/merchandise/details" element={<MerchandiseTabs />} />
            </Route>

            <Route path="/event/attendance_QR" element={<AttendanceQR />} />
            <Route path="*" element={<Navigate to="/event" />} />
          </>
        ) : (
          <>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/password-reset" element={<PasswordResetPage />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;
