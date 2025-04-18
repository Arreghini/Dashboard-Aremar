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
      console.log('Reservas cargadas:', reservationsData);
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

  const handleDelete = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const result = await reservationService.deleteReservation(id, token);
      if (result.success) {
        setReservations(prev => prev.filter(res => res.id !== id));
        alert('Reserva eliminada exitosamente');
      }
    } catch (error) {
      alert(`No se pudo eliminar: ${error.message}`);
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
      const token = await getAccessTokenSilently();
  
      const confirmAction = window.confirm('¿Estás seguro de que deseas confirmar esta reservación?');
      if (!confirmAction) return;
  
      const response = await reservationService.confirmReservationByAdmin(reservationId, token);
  
      if (!response) {
        setError('No se pudo confirmar la reservación');
        return;
      }
  
      const updatedReservations = reservations.map(res =>
        res.id === reservationId ? { ...res, status: 'confirmed' } : res
      );
  
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Error al confirmar la reservación:', error);
      setError('Ocurrió un error al confirmar la reservación');
    }
  };
 

  const handleCancel = async (reservationId) => {
    try {
      const token = await getAccessTokenSilently();
      await reservationService.cancelReservationByAdmin(reservationId, token);
      const updatedReservations = reservations.map(res =>
        res.id === reservationId ? { ...res, status: 'cancelled' } : res
      );
      setReservations(updatedReservations);
    } catch (error) {
      console.error('Error al cancelar la reservación:', error);
    }
  };
  const handleCancelWithRefund = async (reservationId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await reservationService.cancelReservationWithRefund(reservationId, token);
      
      const updatedReservations = reservations.map(res =>
        res.id === reservationId ? { 
          ...res, 
          status: 'cancelled',
          refundAmount: response.refundAmount 
        } : res
      );
      console.log('Reserva actualizada:', updatedReservations);
      
      setReservations(updatedReservations);
      
    } catch (error) {
      console.error('Error al cancelar la reservación con reembolso:', error);
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
                  {reservation.status === 'cancelled' && reservation.refundAmount &&
                    <p className="text-sm text-green-600 font-semibold">
                      Reembolso: ${reservation.refundAmount.toFixed(2)}
                    </p>
                  }

                </div>
              </div>
              <div className="flex justify-end space-x-2">
              <button
                  onClick={() => handleEdit(reservation.id)}
                  disabled={reservation.status === 'cancelled'}
                  className={`text-white px-4 py-2 rounded 
                    ${reservation.status === 'confirmed' || reservation.status === 'cancelled' 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-yellow-500 hover:bg-yellow-600'}`}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleConfirm(reservation.id)}
                  disabled={['confirmed', 'cancelled'].includes(reservation.status.trim())}
                  className={`text-white px-4 py-2 rounded 
                    ${['confirmed', 'cancelled'].includes(reservation.status.trim())
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-green-500 hover:bg-green-600'}`}
                >
                  Confirmar
                </button>
                <button
                  onClick={() => handleCancel(reservation.id)}
                  disabled={['cancelled', 'pending'].includes(reservation.status.trim())}
                  className={`text-white px-4 py-2 rounded 
                    ${['cancelled', 'pending'].includes(reservation.status.trim())
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-500 hover:bg-red-600'}`}
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleCancelWithRefund(reservation.id)}
                  disabled={['cancelled', 'pending'].includes(reservation.status.trim())}
                  className={`text-white px-4 py-2 rounded 
                    ${['cancelled', 'pending'].includes(reservation.status.trim())
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-orange-500 hover:bg-orange-600'}`}
                >
                  Cancelar con reembolso
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
