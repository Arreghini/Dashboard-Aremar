// Este componente ProtectedRoute en src\components\ProtectedRoute.jsx tiene el siguiente propósito y funcionamiento:
// Este componente actúa como un envoltorio de seguridad para rutas protegidas en una aplicación React. Su objetivo principal es asegurar que solo
// los usuarios autenticados y con el rol de administrador puedan acceder a ciertas partes de la aplicación.
// El componente recibe como entrada los elementos hijos (children) que se deben renderizar si el usuario tiene los permisos adecuados. Utiliza el
// hook useAuth0 para obtener información sobre la autenticación del usuario, como si está autenticado, si aún se está cargando la información, y 
// los datos del usuario.
// Como salida, el componente renderiza los elementos hijos si el usuario está autenticado y tiene el rol de administrador. Si no se cumplen estas
// condiciones, no se renderiza nada.
// El componente logra su propósito mediante el siguiente proceso:
// Utiliza useEffect para ejecutar una función cuando cambia el estado de autenticación o los datos del usuario.
// Dentro de esta función, verifica si el usuario está autenticado y si se han cargado sus datos.
// Si es así, busca los roles del usuario en un campo específico de los datos del usuario.
// Comprueba si entre estos roles se encuentra el de "admin".
// Actualiza el estado local isAdmin según el resultado de esta comprobación.
// Durante este proceso, el componente maneja varios estados para controlar la carga y la verificación de roles. Muestra un mensaje de "Loading..."
// mientras se realiza este proceso.
// En resumen, este componente actúa como un guardián, asegurando que solo los usuarios autorizados puedan acceder a ciertas partes de la aplicación,
// proporcionando una capa adicional de seguridad en la interfaz de usuario.

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

  
  // Espera mientras se carga o se verifica el rol
  if (isLoading || checkingRole) {
    console.log('Loading or checking role...');
    return <p>Loading...</p>;
  }

  // Solo renderiza los hijos si está autenticado y es admin
  return isAuthenticated && isAdmin ? children : null;
};

export default ProtectedRoute;
