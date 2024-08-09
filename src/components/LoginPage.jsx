import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LoginPage = () => {
  const { loginWithRedirect, isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          const response = await axios.get('/api/check-role', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (response.data.isAdmin) {
            navigate('/dashboard'); // Redirige al dashboard si es admin
          } else {
            navigate('/'); // Redirige a la página principal si no es admin
          }
        } catch (error) {
          console.error('Error al verificar el rol:', error);
          navigate('/'); // Redirige a la página principal en caso de error
        }
      }
    };

    handleRedirect();
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200 text-black">
      <div className="w-1/3 h-1/3 rounded-lg bg-blue-200 shadow-md p-6">
        <h1 className="font-bold text-2xl mb-4 text-center uppercase">Iniciar Sesión</h1>
        <button
          onClick={() => loginWithRedirect()}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
