import React, { useState } from 'react';
import RoomList from '../components/RoomList';
import ReservationList from '../components/ReservationList';
import UserList from '../components/UserList';
import RoomForm from '../components/RoomForm';
import ReservationForm from '../components/ReservationForm';
import UserForm from '../components/UserForm';

const DashboardPage = () => {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showRooms, setShowRooms] = useState(false);
  const [showReservations, setShowReservations] = useState(false);

  const handleSave = () => {
    setSelectedRoom(null);
    setSelectedReservation(null);
    setSelectedUser(null);
    setRefresh(!refresh);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="w-2/3 h-4/5 bg-yellow-200 shadow-md p-6">
        <h1 className="font-bold text-xl mb-4 text-center">Dashboard del Administrador</h1>

        <div className="mb-4">
          <h2 className="text-center font-bold text-xl mb-2">Usuarios</h2>
          <div className="flex flex-col items-center">
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
              <UserForm user={selectedUser} onSave={handleSave} />
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="font-bold text-xl text-center mb-2">Habitaciones</h2>
          <div className="flex flex-col items-center">
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
              <RoomForm room={selectedRoom} onSave={handleSave} />
            </div>
          )}
        </div>

        <div className="mb-4">
          <h2 className="font-bold text-xl text-center mb-2">Reservas</h2>
          <div className="flex flex-col items-center">
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
              <ReservationForm reservation={selectedReservation} onSave={handleSave} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
