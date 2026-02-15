import React, { useState } from 'react';
import TimerScreen from './TimerScreen'; // Your current file
import AuthScreen from './AuthScreen';   // The file above

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // If not logged in, show Auth. If logged in, show the Timer.
  if (!isLoggedIn) {
    return <AuthScreen onLogin={() => setIsLoggedIn(true)} />;
  }

  return <TimerScreen onLogout={() => setIsLoggedIn(false)} />;
}

