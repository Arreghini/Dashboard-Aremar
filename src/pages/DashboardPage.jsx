// Este archivo define un componente de React llamado DashboardPage que representa una página de panel de control para un administrador. 
// Aquí están las principales características:
// Estados: Utiliza varios estados con useState para manejar el modo oscuro, mostrar/ocultar listas, y gestionar elementos seleccionados.
// Autenticación: Usa useAuth0 para obtener información del usuario autenticado.
// Diseño: Implementa un diseño responsivo con Tailwind CSS, incluyendo un encabezado con título, botón de modo oscuro/claro y botón para volver 
// al inicio.
// Secciones principales:
// Usuarios: Permite crear, listar, editar y eliminar usuarios.
// Habitaciones: Ofrece funcionalidades para gestionar habitaciones.
// Reservas: Proporciona opciones para administrar reservas.
// Componentes hijos: Utiliza componentes como UserList, UserForm, RoomList, RoomForm, ReservationList y ReservationForm para manejar las operaciones CRUD.
// Actualización de datos: Usa un estado 'refresh' para forzar la actualización de las listas cuando se realizan cambios.
// Condicionales: Emplea renderizado condicional para mostrar/ocultar elementos según el estado.
// Estilos dinámicos: Aplica estilos diferentes basados en el modo oscuro/claro.
// Este componente ofrece una interfaz completa para que un administrador gestione usuarios, habitaciones y reservas en un sistema, para un 
// hotel o alojamientos en general.
import React, { useState } from 'react';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import { useAuth0 } from '@auth0/auth0-react';
import UserList from '../components/UserList';
import UserForm from '../components/UserForm';
import RoomList from '../components/RoomList';
import RoomForm from '../components/RoomForm';
import ReservationList from '../components/ReservationList';
import ReservationForm from '../components/ReservationForm';

const DashboardPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [showReservations, setShowReservations] = useState(false);
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
      {/* Header */}
      <div className="flex justify-between items-center p-6 shadow-md">
        {/* Título del dashboard a la izquierda */}
        <h1 className="font-bold text-2xl uppercase">DASHBOARD DEL ADMINISTRADOR</h1>
        
        {/* Botón de Modo Oscuro a la derecha */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-4 py-2 rounded flex items-center ${darkMode ? 'text-white' : 'text-black'}`}
        >
          {darkMode ? <DarkModeIcon className="w-6 h-6 mr-2" /> : <LightModeIcon className="w-6 h-6 mr-2" />}
          {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
        </button>

        {/* Botón Volver a Inicio a la derecha */}
        <button
          onClick={handleReturnToHome}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Volver a Inicio
        </button>
      </div>

      {/* Contenido principal */}
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
