import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const DashboardPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Función para obtener un valor de cookie
        const getCookie = (name) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? match[2] : null;
        };

        // Recupera el usuario y el token desde las cookies
        const user = getCookie('user');
        const token = getCookie('token');

        if (!user || !token) {
          console.log('No se encontró usuario o token en las cookies');
          setShouldRedirect(true);
          return;
        }

        const response = await axios.get('http://localhost:3000/api/users/sync', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });

        console.log('Respuesta del servidor:', response.data);
        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error('Error al verificar el estado de administrador:', error);
        setShouldRedirect(true);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAdmin) {
    console.log('Usuario no es administrador');
    return <div>No tienes permisos para acceder al dashboard</div>;
  }

  if (shouldRedirect) {
    return <Navigate to="http://localhost:5173" />;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
        <div className={`w-2/3 h-4/5 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-blue-200'} shadow-md p-6`}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`mb-4 px-4 py-2 rounded flex items-center ${darkMode ? 'text-white' : 'text-black'}`}
          >
            {darkMode ? <DarkModeIcon className="w-6 h-6 mr-2" /> : <LightModeIcon className="w-6 h-6 mr-2" />}
          </button>
          <h1 className="font-bold text-2xl mb-4 text-center uppercase">DASHBOARD DEL ADMINISTRADOR</h1>
          <button onClick={() => window.location.href = 'http://localhost:5173'} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Volver a Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
