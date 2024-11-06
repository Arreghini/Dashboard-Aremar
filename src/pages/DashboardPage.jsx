import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { FaSun as LightModeIcon, FaMoon as DarkModeIcon } from 'react-icons/fa';
import UserForm from '../components/UserForm';
import UserList from '../components/UserList';
import RoomForm from '../components/RoomForm';
import RoomList from '../components/RoomList';
import ReservationForm from '../components/ReservationForm';
import ReservationList from '../components/ReservationList';
import RoomTypeForm from '../components/RoomTypeForm';
import RoomDetailForm from '../components/RoomDetailForm';

const DashboardPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
  const [showRoomTypes, setShowRoomTypes] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const { user } = useAuth0();

  const handleReturnToHome = () => {
    window.location.href = 'http://localhost:5173';
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
      <div className="flex justify-between items-center p-6 shadow-md">
        <h1 className="font-bold text-2xl uppercase">DASHBOARD DEL ADMINISTRADOR</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-4 py-2 rounded flex items-center ${darkMode ? 'text-white' : 'text-black'}`}
        >
          {darkMode ? <DarkModeIcon className="w-6 h-6 mr-2" /> : <LightModeIcon className="w-6 h-6 mr-2" />}
          {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
        </button>
        <button
          onClick={handleReturnToHome}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver a Inicio
        </button>
      </div>

      <div className={`flex flex-col flex-grow p-6 ${darkMode ? 'bg-gray-900' : 'bg-blue-200'} shadow-md`}>
        {user && (
          <div className="mb-4 text-center">
            <h2 className="font-bold text-lg">Bienvenido, {user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Rol: {user['https://aremar.com/roles'][0]}</p>
          </div>
        )}

        {/* Sección de Usuarios */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase">USUARIOS</h2>
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

        {/* Sección de Tipos y detalles de Habitación */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase">TIPOS y DETALLES DE HABITACIÓN</h2>
          <button onClick={() => setShowRoomTypes(!showRoomTypes)} className="mb-2">
            {showRoomTypes ? 'Ocultar Tipos de Habitación' : 'Mostrar Tipos de Habitación'}
          </button>
          {showRoomTypes && (
            <div className="w-full">
              <RoomTypeForm onRoomTypeCreated={() => setRefresh(!refresh)} />
                <RoomDetailForm onRoomDetailCreated={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>

        {/* Sección de Habitaciones */}
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

        {/* Sección de Reservas */}
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
