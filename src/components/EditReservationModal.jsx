import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const EditReservationModal = ({ isOpen, onClose, reservation, onSave }) => {
  const [formData, setFormData] = useState({
    reservationId: '',
    roomId: '',
    checkIn: '',
    checkOut: '',
    numberOfGuests: 1,
    status: ['pending', 'confimed'],
    totalPrice: '',
    amountPaid: '',
    paymentId: '',
  });

  useEffect(() => {
    if (reservation) {
      console.log('Reserva recibida en el modal:', reservation);
      setFormData({
        reservationId: reservation.id,
        roomId: reservation.roomId,
        checkIn: reservation.checkIn?.split('T')[0] || '',
        checkOut: reservation.checkOut?.split('T')[0] || '',
        numberOfGuests: reservation.numberOfGuests || 1,
        status: reservation.status || 'pending',
        totalPrice: reservation.totalPrice || '',
        amountPaid: reservation.amountPaid || '',
        paymentId: reservation.paymentId || '',
      });
    }
  }, [reservation]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos enviados desde el modal:', formData); // Depuración
    onSave(formData); // Enviar el formulario al método `handleSave`
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          Editar Reserva #{formData.reservationId}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block">
            ID Habitación:
            <input
              type="text"
              name="roomId"
              value={formData.roomId}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Check-in:
            <input
              type="date"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Check-out:
            <input
              type="date"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Número de Huéspedes:
            <input
              type="number"
              name="numberOfGuests"
              value={formData.numberOfGuests}
              min={1}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </label>
          <label className="block">
            Estado:
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </label>
          <label className="block">
            Precio Total:
            <input
              type="text"
              name="totalPrice"
              value={formData.totalPrice}
              readOnly
              className="w-full border px-2 py-1 rounded bg-gray-100"
            />
          </label>
          <label className="block">
            Monto Pagado:
            <input
              type="number"
              name="amountPaid"
              value={formData.amountPaid || ''}
              onChange={handleChange}
              className="w-full border px-2 py-1 rounded"
            />
          </label>
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-400 text-white px-4 py-2 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditReservationModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  reservation: PropTypes.object,
  onSave: PropTypes.func.isRequired,
};

export default EditReservationModal;
