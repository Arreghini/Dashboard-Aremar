import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/reservations/admin';

const getHeaders = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

const getReservations = async (token) => {    
    const response = await axios.get(BASE_URL, getHeaders(token)); 
    return Array.isArray(response.data) ? response.data : [];
};

const createReservation = async (reservationData, token) => {
    const response = await axios.post(BASE_URL, reservationData, getHeaders(token));
    return response.data;     
};

const updateReservationByAdmin = async (id, reservationData, token) => {
  const response = await axios.put(`${BASE_URL}/${id}`, reservationData, getHeaders(token));
  return response.data;
};

const deleteReservation = async (id, token) => {
  const response = await axios.delete(`${BASE_URL}/${id}`, getHeaders(token));
  return response.data;
};

// Confirmación automática al recibir pago del usuario
const confirmReservationAfterPayment = async (id) => {
  const response = await axios.patch(`${BASE_URL}/${id}/confirm`, { status: 'confirmed' });
  if (response.status !== 200) {
    throw new Error('Error al confirmar la reservación después del pago');
  } // Manejo de errores
  return response.data;
};

// Métodos de administrador para confirmación y cancelación
const confirmReservationByAdmin = async (id) => {
  const response = await axios.patch(`${BASE_URL}/${id}/status`, { status: 'confirmed' });
  return response.data;
};

const cancelReservationByAdmin = async (id) => {
  const response = await axios.patch(`${BASE_URL}/${id}/status`, { status: 'canceled' });
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
