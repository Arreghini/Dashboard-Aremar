
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const LoginPage = () => {
  const { loginWithRedirect } = useAuth0();

  const handleLogin = () => {
    loginWithRedirect();
  };

  return (
    <div className="login-container">
      <h1>Login</h1>
      <button onClick={handleLogin}>Login with Auth0</button>
    </div>
  );
};

export default LoginPage;
