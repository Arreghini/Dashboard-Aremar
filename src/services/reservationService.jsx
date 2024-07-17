import axios from 'axios';

const createReservation = async (reservationData) => {
  const response = await axios.post('/api/reservations', reservationData);
  return response.data;
};

const updateReservation = async (id, reservationData) => {
  const response = await axios.put(`/api/reservations/${id}`, reservationData);
  return response.data;
};

const getReservations = async () => {
  const response = await axios.get('/api/reservations');
  return response.data;
};

const deleteReservation= async () => {
    const response = await axios.delete('/api/reservations');
    return response.data;
}

export default {
  createReservation,
  updateReservation,
  getReservations,
  deleteReservation
};
