import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('isAuthenticated:', isAuthenticated);
    console.log('isLoading:', isLoading);
    console.log('user:', user);

    if (!isLoading && isAuthenticated && user) {
      const checkUserRole = async () => {
        try {
          setCheckingRole(true);

          // Obtener roles directamente del usuario
          const roles = user['https://aremar.com/roles'] || [];
          console.log('Roles:', roles);

          // Verificar explícitamente el rol "admin"
          const isAdminRole = roles.includes('admin');
          console.log('Is Admin:', isAdminRole);

          setIsAdmin(isAdminRole);
        } catch (error) {
          console.error('Error checking user role:', error);
        } finally {
          setCheckingRole(false);
        }
      };

      checkUserRole();
    } else {
      console.log('User is not authenticated or still loading.');
      setCheckingRole(false);
    }
  }, [isAuthenticated, isLoading, user]);

  // useEffect(() => {
  //   console.log('Checking redirect conditions...');
  //   if (!isLoading && !checkingRole) {
  //     console.log('isAuthenticated:', isAuthenticated);
  //     console.log('isAdmin2:', isAdmin);

  //     // Se asegura de usar un debugger para confirmar los valores en este momento.
  //     if (!isAuthenticated) {
  //       console.log('User is not authenticated, consider redirecting to login...');
  //       loginWithRedirect();
  //     } else if (!isAdmin) {
  //       console.log('Authenticated but not admin, redirecting to home...');
  //       debugger; // Coloca un punto de interrupción aquí para inspeccionar los valores
  //       window.location.href = 'http://localhost:5173'; // Ajusta la URL según sea necesario
  //     }
  //   }
  // }, [isAuthenticated, isLoading, loginWithRedirect]);

  // Espera mientras se carga o se verifica el rol
  if (isLoading || checkingRole) {
    console.log('Loading or checking role...');
    return <p>Loading...</p>;
  }

  // Solo renderiza los hijos si está autenticado y es admin
  return isAuthenticated && isAdmin ? children : null;
};

export default ProtectedRoute;
