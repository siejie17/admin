import React from 'react';
import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';

import AppLayout from "./layout/AppLayout";
import EventListingPage from "./pages/events/EventListingPage";
import EventCreationPage from './pages/events/EventCreationPage.jsx';
import MerchandiseListingPage from "./pages/merchandise/MerchandiseListingPage";

import LoginPage from './pages/auth/LoginPage';
import PasswordResetPage from "./pages/auth/PasswordResetPage";

import { useAuth } from './contexts/AuthContext.jsx';
import MerchandiseCreationPage from './pages/merchandise/MerchandiseCreationPage.jsx';
import MerchandiseTabs from './pages/merchandise/MerchandiseTabs.jsx';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // Or any loading component
  }

  return (
    <Router>
      <Routes>
        {user ? (
          <>
            <Route element={<AppLayout />}>
              {/* Events Routes */}
              <Route path="/event" element={<EventListingPage />} />
              <Route path="/event/create-event" element={<EventCreationPage />} />
              {/* <Route path="/events/details" element={<EventDetailPage />} /> */}

              {/* Merchandise Routes */}
              <Route path="/merchandise" element={<MerchandiseListingPage />} />
              <Route path="/merchandise/create-merchandise" element={<MerchandiseCreationPage />} />
              <Route path="/merchandise/details" element={<MerchandiseTabs />} />
            </Route>

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
