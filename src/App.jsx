import { Route, BrowserRouter as Router, Routes, Navigate } from 'react-router-dom';

import AppLayout from "./layout/AppLayout";
import EventListingPage from "./pages/events/EventListingPage";
import EventCreationPage from './pages/events/EventCreationPage.jsx';
import EventManager from './pages/events/EventManager.jsx';
import MerchandiseListingPage from "./pages/merchandise/MerchandiseListingPage";

import LoginPage from './pages/auth/LoginPage';
import PasswordResetPage from "./pages/auth/PasswordResetPage";

import { useAuth } from './contexts/AuthContext.jsx';
import MerchandiseCreationPage from './pages/merchandise/MerchandiseCreationPage.jsx';
import Loader from './components/General/Loader.jsx';
import AttendanceQR from './components/Events/Attendance/AttendanceQR.jsx';
import QuestDetails from './components/Events/Quest/QuestDetails.jsx';
import MerchandiseManagerPage from './pages/merchandise/MerchandiseManagerPage.jsx';
import LeaderboardPage from './pages/leaderboard/LeaderboardPage.jsx';
import OverviewPage from './pages/overview/OverviewPage.jsx';
import StatisticsPage from './pages/stats/StatisticsPage.jsx';

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
              <Route path="/statistics" element={<StatisticsPage />} />
              <Route path="/event" element={<EventListingPage />} />
              <Route path="/merchandise" element={<MerchandiseListingPage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
              <Route path="/overview" element={<OverviewPage />} />
            </Route>

            <Route path="/event/create-event" element={<EventCreationPage />} />
            <Route path="/event/details" element={<EventManager />} />
            <Route path="/event/details/quest" element={<QuestDetails />} />
            <Route path="/event/attendance_QR" element={<AttendanceQR />} />

            <Route path="/merchandise/details" element={<MerchandiseManagerPage />} />
            <Route path="/merchandise/create-merchandise" element={<MerchandiseCreationPage />} />
            <Route path="*" element={<Navigate to="/statistics" />} />
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
