import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import AppRouter from './routes/AppRouter';
import AuthRouter from './routes/AuthRouter';
import { useAuth } from './contexts/AuthContext.jsx';

function App() {
  const { user } = useAuth();

  return (
    <Router>
      {user ? <AppRouter /> : <AuthRouter />}
    </Router>
  );
}

export default App;
