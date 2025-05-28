import { useState } from 'react';
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
import Modal from '../components/Modal';
import ReportsPage from './ReportsPage';
import RoomTypeList from '../components/RoomTypeList';

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
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [showReports, setShowReports] = useState(false);

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
          <div className="flex flex-col items-start">
            <button onClick={() => setSelectedRoom(!selectedRoom)} className="mb-2">
              {selectedRoom ? 'Ocultar crear tipo de habitación' : 'Crear tipo de habitación'}
            </button>
          </div>
          {selectedRoom && (
            <div className="mt-4">
              <RoomTypeForm room={selectedRoom} onSave={() => setRefresh(!refresh)} />
              <RoomDetailForm roomDetail={selectedRoom} onSave={() => setRefresh(!refresh)} />
            </div>
          )}
          <button onClick={() => setShowRoomTypes(!showRoomTypes)} className="mb-2">
            {showRoomTypes ? 'Ocultar Tipos de Habitación' : 'Mostrar Tipos de Habitación'}
          </button>
          {showRoomTypes && (
            <div className="w-full">
              <RoomTypeList key={refresh} onEdit={setSelectedRoom} onDelete={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>

        {/* Sección de Habitaciones */}
        <div className="mb-8">
    <h2 className="font-bold text-lg mb-2 text-left uppercase">HABITACIONES</h2>
    <div className="flex flex-col items-start">
      <button 
        className="mb-2" 
        onClick={() => {
          setSelectedRoom({});
          setIsRoomModalOpen(true);
        }}
      >
        Crear Habitación
      </button>
      <button onClick={() => setShowRooms(!showRooms)} className="mb-2">
        {showRooms ? 'Ocultar Lista de Habitaciones' : 'Lista de Habitaciones'}
      </button>
      {showRooms && (
        <div className="w-full">
          <RoomList 
            key={refresh}
            onEdit={(room) => {
              setSelectedRoom(room);
              setIsRoomModalOpen(true);
            }} 
            onDelete={() => setRefresh(!refresh)} 
          />

        </div>
      )}
    </div>
    
    <Modal isOpen={isRoomModalOpen} onClose={() => setIsRoomModalOpen(false)}>
      <RoomForm 
        room={selectedRoom} 
        onSave={() => {
          setRefresh(!refresh);
          setIsRoomModalOpen(false);
        }} 
      />
    </Modal>
  </div>
        {/* Sección de Reservas */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase">RESERVAS</h2>
          <div className="flex flex-col items-start">
            <button className="mb-2" onClick={() => {
              setSelectedReservation({});
              setIsReservationModalOpen(true);
            }}>Crear Reserva
            </button>
            <Modal 
              isOpen={isReservationModalOpen} 
              onClose={() => {
                setIsReservationModalOpen(false);
                setSelectedReservation(null);
              }}
              width="w-11/12 md:w-2/3 lg:w-1/2 xl:w-1/3"
            >
              <ReservationForm
                reservation={selectedReservation || {}}
                onClose={() => {
                  setIsReservationModalOpen(false);
                  setSelectedReservation(null);
                }}
                onSave={() => {
                  setRefresh(!refresh);
                  setIsReservationModalOpen(false);
                  setSelectedReservation(null);
                }}
              />
            </Modal>
            <button onClick={() => setShowReservations(!showReservations)} className="mb-2">
            {showReservations ? 'Ocultar Lista de Reservas' : 'Lista de Reservas'}
          </button>
            {showReservations && (
              <div className="w-full">
               <ReservationList 
                  key={refresh} 
                  onEdit={(reservation) => {
                    setSelectedReservation(reservation);
                    setIsReservationModalOpen(true);
                  }} 
                  onDelete={() => setRefresh(!refresh)} 
                />
              </div>
            )}
           {/* Sección de Reportes */}
          <button onClick={() => setShowReports(!showReports)} className="mb-2">
            {showReports ? 'Ocultar Reportes' : 'Reportes'}
          </button>

          {showReports && (
            <div className="w-full">
              <ReportsPage />
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
