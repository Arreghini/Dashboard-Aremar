import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import reservationService from '../services/reservationService';
import roomService from '../services/roomService';
import EditReservationModal from './EditReservationModal';

const ReservationList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [reservations, setReservations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
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

  const handleEdit = (reservation) => {
    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    setSelectedReservation({
      id: reservation.id,
      roomId: reservation.room?.id || reservation.roomId,
      checkIn: formatDate(reservation.checkIn),
      checkOut: formatDate(reservation.checkOut),
      numberOfGuests: reservation.numberOfGuests,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      amountPaid: reservation.amountPaid,
    });

    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      const token = await getAccessTokenSilently();

      const originalReserve = reservations.find(res => res.id === formData.reservationId);
        const validateDate = (dateString) => {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
          throw new Error(`Fecha inválida: ${dateString}`);
        }
        return date;
      };

      const originalCheckInDate = validateDate(originalReserve.checkIn);
      const originalCheckOutDate = validateDate(originalReserve.checkOut);
      const newCheckInDate = validateDate(formData.checkIn);
      const newCheckOutDate = validateDate(formData.checkOut);

      const originalDays =
        (originalCheckOutDate - originalCheckInDate) / (1000 * 60 * 60 * 24);
      const newDays =
        (newCheckOutDate - newCheckInDate) / (1000 * 60 * 60 * 24);
      const daysDifference = newDays - originalDays;

      const dailyRate = originalReserve.totalPrice / originalDays;

      let refundAmount = 0;
      let additionalAmount = 0;

      if (daysDifference > 0) {
        additionalAmount = dailyRate * daysDifference;

        const actualRoomType = await roomService.getRoomTypeById(formData.roomId, token);
        console.log('Tipo de habitación actual:', actualRoomType);
        if (!actualRoomType) {
          throw new Error('No se encontró el tipo de habitación.');
        }

        console.log('Datos enviados a evaluar disponibilidad:', 
          formData.reservationId,
          actualRoomType.id,
          formData.checkIn, 
          formData.checkOut,
          formData.numberOfGuests,
        );


        const response = await roomService.getAvailableRoomsByType(
          formData.reservationId,
          actualRoomType.id,
          formData.checkIn,
          formData.checkOut,
          formData.numberOfGuests,
          token
        );

        if (!response || response.length === 0) {
          throw new Error('No hay habitaciones disponibles para las nuevas fechas.');
        }

        alert(`El usuario debe pagar un monto adicional de $${additionalAmount.toFixed(2)}.`);
      } else if (daysDifference < 0) {
        refundAmount = dailyRate * Math.abs(daysDifference);

        alert(`Se ha calculado un reembolso de $${refundAmount.toFixed(2)} por la reducción de días.`);
      }

      await reservationService.updateReservationByAdmin(
        formData.reservationId,
        {
          roomId: formData.roomId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          numberOfGuests: formData.numberOfGuests,
          status: formData.status,
          amountPaid: formData.amountPaid,
          refundAmount: refundAmount,
          additionalAmount: additionalAmount,
          paymentId: formData.paymentId || null,
        },
        token
      );

      console.log('Reserva actualizada:', formData);

      await fetchReservations();
      setShowModal(false);
      setSelectedReservation(null);

      if (refundAmount > 0) {
        alert(`Se ha reembolsado $${refundAmount.toFixed(2)} por la diferencia de días.`);
      }
    } catch (error) {
      console.error('Error al guardar los cambios de la reserva:', error.message);
      alert(error.message || 'Ocurrió un error al guardar los cambios.');
    }
  };

  const handleConfirm = async (reservationId) => {
    try {
      const token = await getAccessTokenSilently();
      const amountPaid = prompt('Ingrese el monto pagado por el usuario:');

      if (!amountPaid || isNaN(amountPaid)) {
        alert('Debe ingresar un monto válido.');
        return;
      }

      if (!window.confirm('¿Estás seguro de que deseas confirmar esta reservación?')) return;

      const response = await reservationService.confirmReservationByAdmin(reservationId, token, amountPaid);

      if (!response) {
        setError('No se pudo confirmar la reservación');
        return;
      }

      const updatedReservations = reservations.map(res =>
        res.id === reservationId
          ? { ...res, status: 'confirmed', totalPrice: response.totalPrice }
          : res
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
        res.id === reservationId
          ? {
              ...res,
              status: 'cancelled',
              refundAmount: response.refundAmount,
            }
          : res
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
                  <p>Pagó: ${reservation.amountPaid}</p>
                  <p>Precio: ${reservation.totalPrice}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Información del Cliente</h3>
                  <p>Nombre: {reservation.User?.name}</p>
                  <p>Email: {reservation.User?.email}</p>
                  <h3 className="font-semibold mt-2">Información de la Habitación</h3>
                  <p>Habitación ID: {reservation.roomId}</p>
                  <p>Habitación: {reservation.room?.roomType?.name}</p>
                  {reservation.status === 'cancelled' && reservation.refundAmount && (
                    <p className="text-sm text-green-600 font-semibold">
                      Reembolso: ${reservation.refundAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => handleEdit(reservation)}
                  disabled={reservation.status === 'cancelled'}
                  className={`text-white px-4 py-2 rounded 
                    ${reservation.status === 'cancelled'
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

      {showModal && selectedReservation && (
        <EditReservationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          reservation={selectedReservation}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default ReservationList;
