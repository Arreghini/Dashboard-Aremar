import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import PropTypes from 'prop-types';
// Importa useNavigate solo si vas a usarlo para redireccionar
// import { useNavigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth0();
  // const navigate = useNavigate();

  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const roles = user['https://aremar.com/roles'] || [];
      setIsAdmin(roles.includes('admin'));
      setCheckingRole(false);
    } else {
      setCheckingRole(false);
    }
  }, [isLoading, isAuthenticated, user]);

  if (isLoading || checkingRole) {
    return <p>Loading...</p>;
  }

  return isAuthenticated && isAdmin ? children : null;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
