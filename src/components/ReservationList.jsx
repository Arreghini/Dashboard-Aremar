import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import reservationService from '../services/reservationService';
import roomService from '../services/roomService';
import EditReservationModal from './EditReservationModal';

const ReservationList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]); // estado para filtros
  const [showModal, setShowModal] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [sinceDate, setSinceDate] = useState('');
  const [untilDate, setUntilDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDateRange, setShowDateRange] = useState(false); // controla mostrar inputs fecha

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const reservationsData = await reservationService.getReservations(token);
      const reservationsSorted = reservationsData.sort((a, b) => {
        const dateA = new Date(a.checkIn);
        const dateB = new Date(b.checkIn);
        return dateA - dateB;
      });
      setReservations(reservationsSorted);
      setFilteredReservations(reservationsSorted); // Mostrar todas al cargar
    } catch (error) {
      console.error('Error al cargar las reservas:', error);
      setError(`Error al cargar las reservas: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  // --- Funciones de filtro ---
  const filterByRangeReservations = () => {
    const since = new Date(sinceDate);
    const until = new Date(untilDate);

    if (isNaN(since) || isNaN(until)) {
      alert('Por favor, ingrese fechas válidas.');
      return;
    }

    if (since > until) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin.');
      return;
    }

    const filtered = reservations.filter((res) => {
      const checkInDate = new Date(res.checkIn);
      return checkInDate >= since && checkInDate <= until;
    });

    setFilteredReservations(filtered);
    if (filtered.length === 0) {
      alert('No se encontraron reservas en el rango de fechas seleccionado.');
    }
  };

  const filterByTotalPayment = () => {
    const filtered = reservations.filter(
      (res) => res.totalPrice - res.amountPaid === 0
    );
    setFilteredReservations(filtered);
    if (filtered.length === 0) {
      alert('No se encontraron reservas con saldo saldado.');
    }
  };

  const filterByNoTotalPayment = () => {
    const filtered = reservations.filter(
      (res) => res.totalPrice - res.amountPaid > 0
    );
    setFilteredReservations(filtered);
    if (filtered.length === 0) {
      alert('No se encontraron reservas con saldo pendiente.');
    }
  };

  const filterByName = (name) => {
    const filtered = reservations.filter((res) =>
      res.user?.name.toLowerCase().includes(name.toLowerCase())
    );
    setFilteredReservations(filtered);
    if (filtered.length === 0) {
      alert(`No se encontraron reservas para el usuario "${name}".`);
    }
  };

  const filterByRoomId = (roomId) => {
    const filtered = reservations.filter((res) => res.roomId === roomId);
    setFilteredReservations(filtered);
    if (filtered.length === 0) {
      alert(`No se encontraron reservas para la habitación ID "${roomId}".`);
    }
  };

  // --- Funciones existentes (editar, eliminar, confirmar, cancelar, etc.) ---
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta reserva?'))
      return;
    try {
      const token = await getAccessTokenSilently();
      const result = await reservationService.deleteReservation(id, token);
      if (result.success) {
        setReservations((prev) => prev.filter((res) => res.id !== id));
        setFilteredReservations((prev) => prev.filter((res) => res.id !== id));
        alert('Reserva eliminada exitosamente');
      }
    } catch (error) {
      alert(`No se pudo eliminar: ${error.message}`);
    }
  };

  const handleEdit = (reservation) => {
    const formatDate = (date) => new Date(date).toISOString().split('T')[0];

    setSelectedReservation({
      id: reservation.id,
      roomId: reservation.room?.id || reservation.roomId,
      checkIn: formatDate(reservation.checkIn),
      checkOut: formatDate(reservation.checkOut),
      numberOfGuests: reservation.numberOfGuests,
      paymentId: reservation.paymentId,
      totalPrice: reservation.totalPrice,
      status: reservation.status,
      amountPaid: reservation.amountPaid,
    });

    setShowModal(true);
  };

  const handleSave = async (formData) => {
    try {
      const token = await getAccessTokenSilently();

      const originalReserve = reservations.find(
        (res) => res.id === formData.reservationId
      );
      if (!originalReserve) throw new Error('Reserva original no encontrada.');

      const toDate = (str) => {
        const d = new Date(str);
        if (isNaN(d)) throw new Error(`Fecha inválida: ${str}`);
        return d;
      };

      const originalCheckIn = toDate(originalReserve.checkIn);
      const originalCheckOut = toDate(originalReserve.checkOut);
      const newCheckIn = toDate(formData.checkIn);
      const newCheckOut = toDate(formData.checkOut);

      const originalDays =
        (originalCheckOut - originalCheckIn) / (1000 * 60 * 60 * 24);
      const newDays = (newCheckOut - newCheckIn) / (1000 * 60 * 60 * 24);
      const diff = newDays - originalDays;

      if (originalDays <= 0)
        return alert('La reserva original tiene duración inválida.');
      if (diff === 0)
        return alert('No se han realizado cambios en la reserva.');

      const dailyRate = originalReserve.totalPrice / originalDays;
      let refundAmount = 0;
      let additionalAmount = 0;

      if (diff > 0) {
        additionalAmount = dailyRate * diff;
        const roomType = await roomService.getRoomTypeById(
          formData.roomId,
          token
        );
        if (!roomType) throw new Error('No se encontró el tipo de habitación.');

        const available = await roomService.getAvailableRoomsByType(
          token,
          formData.reservationId,
          roomType.id,
          formData.checkIn,
          formData.checkOut,
          formData.numberOfGuests
        );

        const availableRooms = Array.isArray(available.rooms)
          ? available.rooms
          : [];
        if (!availableRooms.length)
          throw new Error(
            'No hay habitaciones disponibles para las nuevas fechas.'
          );
        alert(
          `El usuario debe pagar un monto adicional de $${additionalAmount.toFixed(
            2
          )}.`
        );
      } else {
        refundAmount = dailyRate * Math.abs(diff);
        alert(`Se ha calculado un reembolso de $${refundAmount.toFixed(2)}.`);
      }

      const response = await reservationService.updateReservationByAdmin(
        formData.reservationId,
        {
          ...formData,
          refundAmount,
          additionalAmount,
        },
        token
      );

      const updated = reservations.map((res) =>
        res.id === formData.reservationId ? { ...res, ...response.data } : res
      );
      setReservations(updated);
      setFilteredReservations(updated); // actualizar filtro también
      setShowModal(false);
      setSelectedReservation(null);
    } catch (error) {
      console.error('Error al guardar la reserva:', error);
      alert(error?.response?.data?.message || error.message);
    }
  };

  const handleConfirm = async (reservationId) => {
    try {
      const token = await getAccessTokenSilently();
      const amountPaid = prompt('Ingrese el monto pagado:');

      if (!amountPaid || isNaN(amountPaid))
        return alert('Debe ingresar un monto válido.');
      if (!window.confirm('¿Confirmar esta reserva?')) return;

      const reservation = reservations.find((res) => res.id === reservationId);
      const response = await reservationService.confirmReservationByAdmin(
        reservationId,
        token,
        {
          ...reservation,
          amountPaid: Number(amountPaid),
        }
      );

      if (!response) return setError('No se pudo confirmar la reserva.');

      const updated = reservations.map((res) =>
        res.id === reservationId ? { ...res, ...response.data } : res
      );
      setReservations(updated);
      setFilteredReservations(updated);
    } catch (error) {
      console.error('Error al confirmar:', error);
      setError('Error al confirmar la reserva.');
    }
  };

  const handleCancel = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await reservationService.cancelReservationByAdmin(id, token);
      const updated = reservations.map((res) =>
        res.id === id ? { ...res, status: 'cancelled' } : res
      );
      setReservations(updated);
      setFilteredReservations(updated);
    } catch (error) {
      console.error('Error al cancelar:', error);
    }
  };

  const handleCancelWithRefund = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await reservationService.cancelReservationWithRefund(
        id,
        token
      );

      const updated = reservations.map((res) =>
        res.id === id
          ? {
              ...res,
              status: 'cancelled',
              refundAmount: response.refundAmount,
            }
          : res
      );
      setReservations(updated);
      setFilteredReservations(updated);
    } catch (error) {
      console.error('Error al cancelar con reembolso:', error);
    }
  };

  return (
    <div className="pt-4 px-6 pb-4 bg-neutral-claro dark:bg-neutral-oscuro min-h-screen font-body
     text-neutral-800 dark:text-neutral-100">
      <h2 className="text-3xl font-heading text-neutral-oscuro dark:text-mar-espuma mb-2">
        Lista de Reservas
      </h2>
<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 items-start 
border border-mar-claro rounded-lg p-8 ">

  {/* Desde */}
  <div className="flex flex-col text-sm text-neutral-700 dark:text-neutral-300 w-full">
    <label htmlFor="since" className="mb-1">Desde:</label>
    <input
      id="since"
      type="date"
      value={sinceDate}
      onChange={(e) => setSinceDate(e.target.value)}
      className="h-10 w-3/4 border border-gray-300 dark:border-neutral-600 bg-white
       dark:bg-neutral-800 text-black dark:text-white px-2 rounded"
    />
  </div>

  {/* Hasta */}
  <div className="flex flex-col text-sm text-neutral-700 dark:text-neutral-300 w-full">
    <label htmlFor="until" className="mb-1">Hasta:</label>
    <input
      id="until"
      type="date"
      value={untilDate}
      onChange={(e) => setUntilDate(e.target.value)}
      className="h-10 w-3/4 border border-neutral-claro dark:border-neutral-oscuro bg-white
       dark:bg-neutral-800 text-black dark:text-white px-2 rounded"
    />
  </div>

  {/* Aplicar rango */}
  <div className="flex flex-col w-full">
    <label className="invisible mb-1">Aplicar</label>
    <button
      onClick={filterByRangeReservations}
      className="h-10 w-3/4 bg-mar-claro text-neutral-claro px-4 rounded font-semibold
       hover:text-neutral-oscuro transition text-left"
    >
      Aplicar
    </button>
  </div>

  {/* Quitar filtros */}
  <div className="flex flex-col w-full">
    <label className="invisible mb-1">Quitar</label>
    <button
      onClick={() => setFilteredReservations(reservations)}
       className="h-10 w-3/4 bg-mar-claro text-neutral-claro px-4 rounded font-semibold
       hover:text-neutral-oscuro transition text-left"
    >
      Quitar
    </button>
  </div>

  {/* Filtrar Saldados */}
  <div className="flex flex-col w-full">
    <label className="invisible mb-1">Saldados</label>
    <button
       className="h-10 w-3/4 bg-mar-claro text-neutral-claro px-4 rounded font-semibold
       hover:text-neutral-oscuro transition text-left"
    >
      Saldados
    </button>
  </div>

  {/* Pendientes de Pago */}
  <div className="flex flex-col w-full">
    <label className="invisible mb-1">Pendientes</label>
    <button
      onClick={filterByNoTotalPayment}
      className="h-10 w-3/4 bg-mar-claro text-neutral-claro px-4 rounded font-semibold
       hover:text-neutral-oscuro transition text-left"
    >
      Pendientes
    </button>
  </div>

  {/* Filtrar por Nombre */}
  <div className="flex flex-col w-full">
    <label className="invisible mb-1">Nombre</label>
    <button
      onClick={() => filterByName(prompt('Ingrese el nombre del cliente:'))}
      className="h-10 w-3/4 bg-mar-claro text-neutral-claro px-4 rounded font-semibold
       hover:text-neutral-oscuro transition text-left"
    >
      Por Nombre
    </button>
  </div>

  {/* Filtrar por Habitación */}
  <div className="flex flex-col w-full">
    <label className="invisible mb-1">Habitación</label>
    <button
      onClick={() => filterByRoomId(prompt('Ingrese el ID de la habitación:'))}
       className="h-10 w-3/4 bg-mar-claro text-neutral-claro px-4 rounded font-semibold
       hover:text-neutral-oscuro transition text-left"
    >
      Por Habitación
    </button>
  </div>
</div>

      {loading ? (
        <p className="text-mar-claro">Cargando reservas...</p>
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : filteredReservations.length === 0 ? (
        <p className="text-neutral-300">No hay reservas disponibles</p>
      ) : (
        <div className="grid gap-6">
          {filteredReservations.map((r) => (
            <div
              key={r.id}
              data-testid={`reservation-card-${r.id}`} // <- agregado
              className="bg-neutral-claro dark:bg-neutral-oscuro rounded-xl shadow-lg border border-mar-claro p-6"
            >
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="font-semibold text-mar-profundo">
                    Detalles de la Reserva
                  </h3>
                  <p>
                    <strong>ID:</strong> {r.id}
                  </p>
                  <p>
                    <strong>Check-in:</strong>{' '}
                    {new Date(r.checkIn).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Check-out:</strong>{' '}
                    {new Date(r.checkOut).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Huéspedes:</strong> {r.numberOfGuests}
                  </p>
                  <p>
                    <strong>Estado:</strong> {r.status}
                  </p>
                  <p>
                    <strong>Precio:</strong> ${r.totalPrice}
                  </p>
                  <p>
                    <strong>Pagó:</strong> ${r.amountPaid}
                  </p>
                  <p>
                    {r.totalPrice - r.amountPaid === 0 ? (
                      <span className="text-green-600">Saldado</span>
                    ) : (
                      <span className="text-red-600">
                        Saldo: ${r.totalPrice - r.amountPaid}
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-mar-profundo">
                    Información del Cliente
                  </h3>
                  <p>
                    <strong>Nombre:</strong> {r.user?.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {r.user?.email}
                  </p>
                  <h3 className="font-semibold mt-2 text-mar-profundo">
                    Habitación
                  </h3>
                  <p>
                    <strong>ID:</strong> {r.roomId}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {r.room?.roomType?.name}
                  </p>
                  {r.status === 'cancelled' && r.refundAmount && (
                    <p className="text-sm text-green-600 font-semibold mt-1">
                      Reembolso: ${r.refundAmount.toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-2 mt-4">
                <button
                  onClick={() => handleEdit(r)}
                  disabled={r.status === 'cancelled'}
                  className={`text-white px-4 py-2 rounded font-semibold transition ${
                    r.status === 'cancelled'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-playa-sol hover:bg-yellow-400'
                  }`}
                >
                  Editar
                </button>

                <button
                  onClick={() => handleConfirm(r.id)}
                  disabled={['confirmed', 'cancelled'].includes(r.status.trim())}
                  className={`text-white px-4 py-2 rounded font-semibold transition ${
                    ['confirmed', 'cancelled'].includes(r.status.trim())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-mar-claro hover:bg-mar-profundo'
                  }`}
                >
                  Confirmar
                </button>

                <button
                  onClick={() => handleCancel(r.id)}
                  disabled={['cancelled', 'pending'].includes(r.status.trim())}
                  className={`text-white px-4 py-2 rounded font-semibold transition ${
                    ['cancelled', 'pending'].includes(r.status.trim())
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-red-500 hover:bg-red-600'
                  }`}
                >
                  Cancelar
                </button>

                <button
                  onClick={() => handleCancelWithRefund(r.id)}
                  disabled={r.status.trim() !== 'confirmed'}
                  className={`text-white px-4 py-2 rounded font-semibold transition ${
                    r.status.trim() !== 'confirmed'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-mar-claro hover:bg-playa-sol text-neutral-oscuro'
                  }`}
                >
                  Cancelar con Reembolso
                </button>

                <button
                  onClick={() => handleDelete(r.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-700"
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