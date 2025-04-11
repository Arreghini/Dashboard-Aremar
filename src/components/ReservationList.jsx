import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import reservationService from '../services/reservationService';

const ReservationList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const reservationsData = await reservationService.getReservations(token);
      setReservations(reservationsData);
    } catch (error) {
      setError(`Error de autenticación: ${error.message}`);
      console.error('Error al cargar las reservas:', error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReservations();
  }, [getAccessTokenSilently]);

  const handleDelete = async (reservationId) => {
    try {
      if (window.confirm('¿Estás seguro de que deseas eliminar esta reservación?')) {
        const token = await getAccessTokenSilently();
        await reservationService.deleteReservation(reservationId, token);
        const updatedReservations = reservations.filter(res => res.id !== reservationId);
        setReservations(updatedReservations);
      }
    } catch (error) {
      console.error('Error al eliminar la reservación:', error);
    }
  };

  const handleEdit = async (reservationId) => {
    try {
      const token = await getAccessTokenSilently();
      if (window.confirm('¿Estás seguro de que deseas editar esta reservación?')) {
        const response = await reservationService.updateReservationByAdmin(reservationId, token);
        if (!response) {
          setError('No se pudo editar la reservación');
          return;
        }

        const updatedReservations = reservations.map(res =>
          res.id === reservationId ? { ...res, ...response } : res
        );

        setReservations(updatedReservations);
      }
    } catch (error) {
      console.error('Error al editar la reservación:', error);
    }
  };

  const handleConfirm = async (reservationId) => {
    try {
      await reservationService.confirmReservation(reservationId);
      const updatedReservations = reservations.map(res =>
        res.id === reservationId ? { ...res, status: 'confirmed' } : res
      );
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Error al confirmar la reservación:', error);
    }
  };

  const handleCancel = async (reservationId) => {
    try {
      await reservationService.cancelReservation(reservationId);
      const updatedReservations = reservations.map(res =>
        res.id === reservationId ? { ...res, status: 'cancelled' } : res
      );
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Error al cancelar la reservación:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Lista de Reservas</h2>
      {loading ? (
        <p>Cargando reservas...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : reservations.length === 0 ? (
        <p>No hay reservas disponibles</p>
      ) : (
        <div className="grid gap-4">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="border p-4 rounded shadow-md">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold">Detalles de la Reserva</h3>
                  <p>ID: {reservation.id}</p>
                  <p>Check-in: {new Date(reservation.checkIn).toLocaleDateString()}</p>
                  <p>Check-out: {new Date(reservation.checkOut).toLocaleDateString()}</p>
                  <p>Huéspedes: {reservation.numberOfGuests}</p>
                  <p>Estado: {reservation.status}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Información del Cliente</h3>
                  <p>Nombre: {reservation.User?.name}</p>
                  <p>Email: {reservation.User?.email}</p>
                  <h3 className="font-semibold mt-2">Información de la Habitación</h3>
                  <p>Habitación ID: {reservation.Room?.id}</p>
                  <p>Estado de habitación: {reservation.Room?.status}</p>
                  <p>Tipo: {reservation.Room?.RoomType?.name}</p>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(reservation.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleConfirm(reservation.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => handleCancel(reservation.id)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(reservation.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReservationList;
