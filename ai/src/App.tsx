import { Store } from "lucide-react";
import React, { useState } from 'react';
import Login from './component/login';
import SignUp from './component/sign';
import AiPaintSpecialist from './component/chat';

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    setIsLoggedIn(true);
  };

  if (!isLoggedIn) {
    return authMode === 'login' ? 
      <Login onSwitch={() => setAuthMode('signup')} onLoginSuccess={handleLoginSuccess} /> : 
      <SignUp onSwitch={() => setAuthMode('login')} onSuccess={() => setAuthMode('login')} />;
  }

  return <AiPaintSpecialist currentUser={user} />;
};

export default App;