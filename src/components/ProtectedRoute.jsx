import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, getAccessTokenSilently, isLoading, loginWithRedirect, user } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      try {
        if (!isAuthenticated) {
          loginWithRedirect();
          return;
        }

        const token = await getAccessTokenSilently();
        const decodedToken = JSON.parse(atob(token.split('.')[1])); // Decodifica el token de acceso

        const userRoles = decodedToken['https://aremar.com/roles'];
        if (userRoles && userRoles.includes('admin')) {
          setIsAdmin(true);
        } else {
          console.log('Usuario no es administrador');
          await loginWithRedirect();
        }
      } catch (error) {
        console.error('Error al obtener el token de acceso:', error);
        await loginWithRedirect();
      } finally {
        setCheckingRole(false);
      }
    };

    // Aseguramos que esto solo se ejecute una vez cuando el componente se monte o cuando cambie isAuthenticated
    if (isAuthenticated && checkingRole) {
      checkAdminRole();
    }
  }, [isAuthenticated, getAccessTokenSilently, loginWithRedirect]);

  // Mostrar un mensaje de carga mientras verifica la autenticación y el rol
  if (isLoading || checkingRole) {
    return <div>Cargando...</div>;
  }

  // Si no es administrador, redirigir a la página de inicio
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Renderiza el contenido protegido si es un administrador
  return <>{children}</>;
};

export default ProtectedRoute;
