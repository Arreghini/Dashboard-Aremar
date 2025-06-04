import React, { useState, useEffect } from 'react';
import userService from '../services/userService';
import reservationService from '../services/reservationService';
import roomService from '../services/roomService';
import { useAuth0 } from '@auth0/auth0-react';

const ReservationForm = ({ onClose, onSave }) => {
  const [users, setUsers] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [formData, setFormData] = useState({
    userId: '',
    roomId: '',
    roomTypeId: '',
    checkIn: '',
    checkOut: '',
    numberOfGuests: 1,
  });

  const { getAccessTokenSilently, user } = useAuth0();
  const userRole = user?.['https://aremar.com/roles']?.[0];
  const isAdmin = userRole === 'admin';

  // 🧠 Traer usuarios si es admin
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

  // 🏠 Traer tipos de habitación
  useEffect(() => {
  const fetchRoomTypes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await roomService.getRoomTypes(token);
      console.log('Tipos de habitación recibidos:', response);

      if (Array.isArray(response)) {
        setRoomTypes(response);
      } else if (Array.isArray(response.data)) {
        setRoomTypes(response.data); // 👈 este es el caso real
      } else {
        setRoomTypes([]);
      }
    } catch (error) {
      setRoomTypes([]);
      console.error('Error al obtener los tipos de habitación:', error);
    }
  };

  fetchRoomTypes(); // 👈 ya está dentro del useEffect, así que no hace falta llamarlo afuera
}, [getAccessTokenSilently]);

  // 🧼 Limpiar habitación si cambian los datos base
  useEffect(() => {
    setFormData(prev => ({ ...prev, roomId: '' }));
  }, [formData.roomTypeId, formData.checkIn, formData.checkOut, formData.numberOfGuests]);

  // 📆 Traer habitaciones disponibles
  useEffect(() => {
    const fetchAvailableRooms = async () => {
      const { roomTypeId, checkIn, checkOut, numberOfGuests } = formData;

      if (!roomTypeId || !checkIn || !checkOut || !numberOfGuests) {
        setAvailableRooms([]);
        return;
      }

      setLoadingRooms(true);

      try {
        const token = await getAccessTokenSilently();
        const data = await roomService.getAvailableRoomsByType(
          token,
          undefined,
          roomTypeId,
          checkIn,
          checkOut,
          numberOfGuests
        );
        setAvailableRooms(data.rooms || []);
      } catch (error) {
        setAvailableRooms([]);
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchAvailableRooms();
  }, [formData.roomTypeId, formData.checkIn, formData.checkOut, formData.numberOfGuests]);

  // 🧾 Cambios en los inputs
  const handleChange = (e) => {
  const { name, value } = e.target;
  const parsedValue = ['roomTypeId', 'numberOfGuests'].includes(name)
    ? value  
    : value;

  setFormData((prevData) => ({
    ...prevData,
    [name]: parsedValue,
  }));
};
  
  // 💾 Enviar reserva
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (new Date(formData.checkIn) >= new Date(formData.checkOut)) {
      alert('La fecha de egreso debe ser posterior a la de ingreso.');
      return;
    }
  
    try {
      const token = await getAccessTokenSilently();
  
      // Convertir a formato ISO si es necesario
      const payload = {
        ...formData,
        userId: isAdmin ? formData.userId : user.sub,
        checkIn: new Date(formData.checkIn).toISOString(),
        checkOut: new Date(formData.checkOut).toISOString(),
      };
  
      console.log("Payload a enviar:", payload);
      await reservationService.createReservation(payload, token);
      onSave();
      onClose();
      alert('Reserva creada con éxito.');
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      alert('Hubo un problema al guardar la reserva.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4 text-center">Crear Nueva Reserva</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {isAdmin ? (
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
        ) : (
          <div className="text-sm text-gray-700">
            Reservando como: <span className="font-semibold">{user?.name}</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Tipo de Habitación</label>
          <select
            name="roomTypeId"
            value={formData.roomTypeId}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Seleccione un tipo</option>
            {roomTypes.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Ingreso</label>
          <input
            type="date"
            name="checkIn"
            value={formData.checkIn}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fecha de Egreso</label>
          <input
            type="date"
            name="checkOut"
            value={formData.checkOut}
            onChange={handleChange}
            required
            min={formData.checkIn}
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

        {formData.roomTypeId && formData.checkIn && formData.checkOut && (
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

           {!loadingRooms && availableRooms.length === 0 && (
            <p className="text-sm text-red-500 mt-2">
              No hay habitaciones disponibles para los datos seleccionados.
            </p>
          )}
          </div>
        )}

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
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            disabled={!formData.roomId}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm;
