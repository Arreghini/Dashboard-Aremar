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

  const handleSave = () => {
    setSelectedRoom(null);
    setSelectedReservation(null);
    setSelectedUser(null);
    setRefresh(!refresh);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <div className="w-2/3 h-4/5 bg-yellow-200 shadow-md p-6 text-center">
        <h1 className="font-bold text-xl mb-4">Dashboard del Administrador</h1>

        <h2 className="font-bold text-xl mb-2">Usuarios</h2>
        <UserList key={refresh} onEdit={setSelectedUser} />
        {selectedUser && (
          <UserForm user={selectedUser} onSave={handleSave} />
        )}
        <button onClick={() => setSelectedUser({})}>Create User</button>

        <h2 className="font-bold text-xl mt-6 mb-2">Habitaciones</h2>
        <RoomList key={refresh} onEdit={setSelectedRoom} />
        {selectedRoom && (
          <RoomForm room={selectedRoom} onSave={handleSave} />
        )}
        <button onClick={() => setSelectedRoom({})}>Create Room</button>

        <h2 className="font-bold text-xl mt-6 mb-2">Reservas</h2>
        <ReservationList key={refresh} onEdit={setSelectedReservation} />
        {selectedReservation && (
          <ReservationForm reservation={selectedReservation} onSave={handleSave} />
        )}
        <button onClick={() => setSelectedReservation({})}>Create Reservation</button>
      </div>
    </div>
  );
};

export default DashboardPage;
