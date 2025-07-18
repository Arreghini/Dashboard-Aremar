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
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [showRoomTypeForm, setShowRoomTypeForm] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
  const [showReports, setShowReports] = useState(false);

  const { user } = useAuth0();

  const handleReturnToHome = () => {
    window.location.href = 'http://localhost:5173/home';
  };

  // ✅ Clases comunes para todos los botones
  const buttonBase = `mb-2 w-60 px-4 py-2 rounded font-body text-base transition-colors`;
  const buttonColor = darkMode
    ? 'bg-mar-espuma text-neutral-oscuro hover:text-neutral-claro'
    : 'bg-mar-claro text-neutral-claro hover:text-neutral-oscuro';

  return (
    <div
      className={`flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? 'bg-neutral-oscuro text-neutral-claro' : 'bg-neutral-claro text-neutral-oscuro'}`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center p-6 shadow-md bg-mar-profundo text-neutral-claro">
        <h1 className="font-heading text-2xl font-bold uppercase">
          DASHBOARD DEL ADMINISTRADOR
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`${buttonBase} ${buttonColor} flex items-center gap-2`}
          >
            {darkMode ? (
              <DarkModeIcon className="w-5 h-5" />
            ) : (
              <LightModeIcon className="w-5 h-5" />
            )}
            {darkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>

          <button
            onClick={handleReturnToHome}
            className={`${buttonBase} ${buttonColor}`}
          >
            Volver a Inicio
          </button>
        </div>
      </div>

      {/* CONTENIDO */}
        <div className={`px-4 py-8flex flex-col min-h-screen transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
        {user && (
  <div className="mb-4 text-left font-body text-base leading-relaxed">
    <h2 className="font-heading text-lg font-bold mb-2 uppercase text-mar-profundo dark:text-playa-arena">
      Bienvenido, {user.name}
    </h2>
    <p className="mb-1 text-neutral-oscuro dark:text-neutral-claro">
      <span className="font-semibold">Email:</span> {user.email}
    </p>
    <p className="text-neutral-oscuro dark:text-neutral-claro">
      <span className="font-semibold">Rol:</span>{' '}
      {user['https://aremar.com/roles']?.[0] || 'No asignado'}
    </p>
  </div>
)} 

        {/* USUARIOS */}
        <div className="mb-8">
          <h2 className="font-heading text-lg font-bold mb-2 text-left uppercase text-mar-profundo dark:text-playa-arena">
          Usuarios
          </h2>
          <div className="flex flex-col items-start">
            <button className={`${buttonBase} ${buttonColor}`} onClick={() => setSelectedUser({})}>Crear Usuario</button>
            <button className={`${buttonBase} ${buttonColor}`} onClick={() => setShowUsers(!showUsers)}>
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

        {/* TIPO DE HABITACIÓN */}
        <div className="mb-8">
          <h2 className="font-heading text-lg font-bold mb-2 text-left uppercase text-mar-profundo dark:text-playa-arena">
          Tipo de Habitación
          </h2>
          <div className="flex flex-col items-start">
            <button
              className={`${buttonBase} ${buttonColor}`}
              onClick={() => {
                setSelectedRoomType({});
                setShowRoomTypeForm(!showRoomTypeForm);
              }}
            >
              {showRoomTypeForm ? 'Ocultar Crear Tipo de Habitación' : 'Crear Tipo de Habitación'}
            </button>
            {showRoomTypeForm && (
              <div className="mt-4">
                <RoomTypeForm
                  room={selectedRoomType}
                  onSave={() => {
                    setRefresh(!refresh);
                    setShowRoomTypeForm(false);
                  }}
                />
              </div>
            )}
            <button
              className={`${buttonBase} ${buttonColor}`}
              onClick={() => setShowRoomTypes(!showRoomTypes)}
            >
              {showRoomTypes ? 'Ocultar Tipos de Habitación' : 'Mostrar Tipos de Habitación'}
            </button>
            {showRoomTypes && (
              <div className="w-full">
                <RoomTypeList
                  key={refresh}
                  onEdit={(roomType) => {
                    setSelectedRoomType(roomType);
                    setShowRoomTypeForm(true);
                  }}
                  onDelete={() => setRefresh(!refresh)}
                />
              </div>
            )}
          </div>
        </div>

        {/* SERVICIOS DE HABITACIÓN */}
        <div className="mb-8">
          <h2 className="font-heading text-lg font-bold mb-2 w-60 text-left uppercase text-mar-profundo dark:text-playa-arena">
            🛠️ Servicios de Habitación
          </h2>
          <div className="flex flex-col items-start">
            <button
              onClick={() => setShowRoomDetails(!showRoomDetails)}
              className={`${buttonBase} ${buttonColor}`}
            >
              {showRoomDetails
                ? 'Ocultar Administrador de Servicios'
                : 'Administrar Combinaciones de Servicios'}
            </button>
          </div>
          {showRoomDetails && (
            <div className="w-full mt-4">
              <RoomDetailForm key={refresh} onRoomDetailCreated={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>

        {/* HABITACIONES */}
        <div className="mb-8">
          <h2 className="font-heading text-lg font-bold mb-2 text-left uppercase text-mar-profundo dark:text-playa-arena">
          Habitaciones
          </h2>
          <div className="flex flex-col items-start">
            <button
              className={`${buttonBase} ${buttonColor}`}
              onClick={() => {
                setSelectedRoom({});
                setIsRoomModalOpen(true);
              }}
            >
              Crear Habitación
            </button>
            <button
              className={`${buttonBase} ${buttonColor}`}
              onClick={() => setShowRooms(!showRooms)}
            >
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
              onRoomCreated={() => {
                setRefresh(!refresh);
                setIsRoomModalOpen(false);
              }}
            />
          </Modal>
        </div>

        {/* RESERVAS */}
        <div className="mb-8">
          <h2 className="font-heading text-lg font-bold mb-2 text-left uppercase text-mar-profundo dark:text-playa-arena">
          Reservas
          </h2>
          <div className="flex flex-col items-start">
            <button
              className={`${buttonBase} ${buttonColor}`}
              onClick={() => {
                setSelectedReservation({});
                setIsReservationModalOpen(true);
              }}
            >
              Crear Reserva
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
            <button
              className={`${buttonBase} ${buttonColor}`}
              onClick={() => setShowReservations(!showReservations)}
            >
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
            <button
              className={`${buttonBase} ${buttonColor}`}
              onClick={() => setShowReports(!showReports)}
            >
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
