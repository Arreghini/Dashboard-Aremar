import React, { useState, useEffect } from 'react';
import userService from '../services/userService'; // Servicio para obtener usuarios
import reservationService from '../services/reservationService';

const ReservationForm = ({ onClose, onSave }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [roomId, setRoomId] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      const data = await userService.getUsers();
      setUsers(data);
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await reservationService.createReservation({
      userId: selectedUser,
      roomId,
      date,
    });
    onSave(); // Actualiza la lista de reservas
    onClose(); // Cierra el formulario
  };

  return (
    <div className="reservation-form">
      <h2>Crear Nueva Reserva</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Seleccionar Usuario:
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} required>
            <option value="">Seleccione un usuario</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </label>

        <label>
          Habitación:
          <input
            type="text"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          />
        </label>

        <label>
          Fecha:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <button type="submit">Guardar Reserva</button>
        <button type="button" onClick={onClose}>Cancelar</button>
      </form>
    </div>
  );
};

export default ReservationForm;
