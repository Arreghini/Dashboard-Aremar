import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth0();
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    console.log('isLoading:', isLoading, 'isAuthenticated:', isAuthenticated);
    if (!isLoading && !isAuthenticated) {
      window.alert('No tiene permisos de navegación en esta ruta');
      setRedirect(true);
    }
  }, [isAuthenticated, isLoading]);

  if (redirect) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return children;
};


export default ProtectedRoute;
