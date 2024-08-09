import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { isAuthenticated, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (isAuthenticated) {
        try {
          const token = await getAccessTokenSilently();
          // Aquí haces una solicitud al backend para verificar el rol
          const response = await axios.get('/api/check-role', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.data.isAdmin) {
            setIsAdmin(true);
          } else {
            navigate('/'); // Redirige si no es admin
          }
        } catch (error) {
          console.error('Error al verificar el rol:', error);
          navigate('/');
        }
      } else {
        navigate('/login');
      }
    };

    checkAdminRole();
  }, [isAuthenticated, getAccessTokenSilently, navigate]);

  if (!isAuthenticated) {
    return <div>Loading...</div>; // Mostrar un indicador de carga mientras se verifica la autenticación
  }

  if (!isAdmin) {
    return null; // Mostrar nada o un mensaje de acceso denegado si no es administrador
  }

  return (
    <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
      <div className={`w-2/3 h-4/5 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-blue-200'} shadow-md p-6`}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`mb-4 px-4 py-2 rounded flex items-center ${darkMode ? 'text-white' : 'text-black'}`}
        >
          {!darkMode ? (
            <LightModeIcon className="w-6 h-6 mr-2" />
          ) : (
            <DarkModeIcon className="w-6 h-6 mr-2" />
          )}
        </button>

        <h1 className="font-bold text-2xl mb-4 text-center uppercase">DASHBOARD DEL ADMINISTRADOR</h1>

        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase mt-10">USUARIOS</h2>
          <div className="flex flex-col items-start">
            <button className="mb-2" onClick={() => setSelectedUser({})}>Crear Usuario</button>
            <button onClick={() => setShowUsers(!showUsers)} className="mb-2">
              {showUsers ? 'Ocultar Lista de Usuarios' : 'Lista de Usuarios'}
            </button>
            {showUsers && (
              <div className="w-full">
                <UserList key={refresh} onEdit={setSelectedUser} onDelete={() => setRefresh(!refresh)} />
              </div>
            )}
          </div>
          {selectedUser && (
            <div className="mt-4">
              <UserForm user={selectedUser} onSave={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase">HABITACIONES</h2>
          <div className="flex flex-col items-start">
            <button className="mb-2" onClick={() => setSelectedRoom({})}>Crear Habitación</button>
            <button onClick={() => setShowRooms(!showRooms)} className="mb-2">
              {showRooms ? 'Ocultar Lista de Habitaciones' : 'Lista de Habitaciones'}
            </button>
            {showRooms && (
              <div className="w-full">
                <RoomList key={refresh} onEdit={setSelectedRoom} onDelete={() => setRefresh(!refresh)} />
              </div>
            )}
          </div>
          {selectedRoom && (
            <div className="mt-4">
              <RoomForm room={selectedRoom} onSave={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>

        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase">RESERVAS</h2>
          <div className="flex flex-col items-start">
            <button className="mb-2" onClick={() => setSelectedReservation({})}>Crear Reserva</button>
            <button onClick={() => setShowReservations(!showReservations)} className="mb-2">
              {showReservations ? 'Ocultar Lista de Reservas' : 'Lista de Reservas'}
            </button>
            {showReservations && (
              <div className="w-full">
                <ReservationList key={refresh} onEdit={setSelectedReservation} onDelete={() => setRefresh(!refresh)} />
              </div>
            )}
          </div>
          {selectedReservation && (
            <div className="mt-4">
              <ReservationForm reservation={selectedReservation} onSave={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
