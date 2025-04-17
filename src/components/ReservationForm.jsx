import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import reservationService from '../services/reservationService';
import roomService from '../services/roomService';
import { useAuth0 } from '@auth0/auth0-react';

const ReservationForm = ({ onClose, onSave }) => {
  const [users, setUsers] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    roomId: '',
    roomTypeId: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
  });

  const { getAccessTokenSilently, user } = useAuth0();
  const userRole = user['https://aremar.com/roles']?.[0];
  const isAdmin = userRole === 'admin';

  // Traer usuarios si es admin
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;
      try {
        const token = await getAccessTokenSilently();
        const data = await userService.getUsers(token);
        setUsers(data);
      } catch (error) {
        console.error('Error al obtener los usuarios:', error);
      }
    };

    fetchUsers();
  }, [getAccessTokenSilently, isAdmin]);

  // Traer tipos de habitación
  useEffect(() => {
    const fetchRoomTypes = async () => {
      try {
        const token = await getAccessTokenSilently();
        const data = await roomService.getRoomTypes(token);
        setRoomTypes(data);
      } catch (error) {
        console.error('Error al obtener los tipos de habitación:', error);
      }
    };
    fetchRoomTypes();
  }, [getAccessTokenSilently]);

  // useEffect para traer habitaciones disponibles cuando se completa toda la info relevante
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      const { roomTypeId, checkInDate, checkOutDate, numberOfGuests } = formData;
  
      // Validación: no hacer nada si falta algún campo
      if (!roomTypeId || !checkInDate || !checkOutDate || !numberOfGuests) {
        setAvailableRooms([]); // opcional: limpiar lista previa si se cambia algo
        return;
      }
  
      try {
        const token = await getAccessTokenSilently();
        const data = await roomService.getAvailableRoomsByType(
          token,
          roomTypeId,
          checkInDate,
          checkOutDate,
          numberOfGuests
        );
        setAvailableRooms(data);
      } catch (error) {
        console.error('Error al obtener habitaciones disponibles:', error);
        setAvailableRooms([]);
      }
    };
  
    fetchAvailableRooms();
  }, [formData.roomTypeId, formData.checkInDate, formData.checkOutDate, formData.numberOfGuests]);
  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.name === 'numberOfGuests'
        ? parseInt(e.target.value)
        : e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      const payload = {
        ...formData,
        userId: isAdmin ? formData.userId : user.sub,
      };
      await reservationService.createReservation(payload, token);
      onSave();
      onClose();
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      alert('Hubo un problema al guardar la reserva.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Crear Nueva Reserva</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isAdmin && (
          <div>
            <label className="block text-sm font-medium mb-1">Usuario</label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Seleccione un usuario</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
        {availableRooms.length > 0 && (
        <div>
          <label className="block text-sm font-medium mb-1">Habitación Disponible</label>
          <select
            name="roomId"
            value={formData.roomId}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccione una habitación</option>
            {availableRooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.id} - {room.description}
              </option>
            ))}
          </select>
        </div>
      )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
          <input
            type="date"
            name="checkInDate"
            value={formData.checkInDate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Egreso</label>
          <input
            type="date"
            name="checkOutDate"
            value={formData.checkOutDate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cantidad de Huéspedes</label>
          <input
            type="number"
            name="numberOfGuests"
            value={formData.numberOfGuests}
            onChange={handleChange}
            min="1"
            max="4"
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
