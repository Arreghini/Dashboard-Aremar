import axios from 'axios';

// Crear o agregar reserva
const createReservation = async (reservationData) => {
  const response = await axios.post('/api/reservations', reservationData);
  return response.data;
};

// Actualizar reserva (para admin)
const updateReservationByAdmin = async (id, reservationData) => {
  const response = await axios.put(`/api/admin/reservations/${id}`, reservationData);
  return response.data;
};

// Confirmación automática al recibir pago del usuario
const confirmReservationAfterPayment = async (id) => {
  const response = await axios.patch(`/api/reservations/${id}/confirm`);
  return response.data;
};

// Obtener todas las reservas
const getReservations = async () => {
  const response = await axios.get('/api/reservations');
  return response.data;
};

// Eliminar una reserva
const deleteReservation = async (id) => {
  const response = await axios.delete(`/api/reservations/${id}`);
  return response.data;
};

// Métodos de administrador para confirmación y cancelación
const confirmReservationByAdmin = async (id) => {
  const response = await axios.patch(`/api/admin/reservations/${id}/status`, { status: 'confirmed' });
  return response.data;
};

const cancelReservationByAdmin = async (id) => {
  const response = await axios.patch(`/api/admin/reservations/${id}/status`, { status: 'canceled' });
  return response.data;
};

export default {
  createReservation,
  updateReservationByAdmin,
  confirmReservationAfterPayment,
  getReservations,
  deleteReservation,
  confirmReservationByAdmin,
  cancelReservationByAdmin,
};
