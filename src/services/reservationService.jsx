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
    const response = await axios.get(`${BASE_URL}`, getHeaders(token)); 
    return Array.isArray(response.data) ? response.data : [];
};

const createReservation = async (reservationData, token) => {
    const response = await axios.post(`${BASE_URL}`, 
      reservationData, 
      getHeaders(token));
    return response.data;     
};

const updateReservationByAdmin = async (id, reservationData, token) => {
  console.log('Datos enviados al backend:', id,reservationData); // Depuración
  try {
    const response = await axios.patch(
      `${BASE_URL}/${id}`,
      reservationData, 
      getHeaders(token)
    );

    if (response.status === 200) {
      return {
        success: true,
        data: response.data,
        message: 'Reserva actualizada exitosamente',
      };
    }

    return response.data;
  } catch (error) {
    console.error('Error en updateReservationByAdmin:', error);
    throw error;
  }
};

const deleteReservation = async (id, token) => {
  const response = await axios.delete(`${BASE_URL}/${id}`, {
         ...getHeaders(token),
         validateStatus: status => status < 500
       });
      if (response.status === 200) {
        return {
          success: true,
          data: response.data,
          message: 'Reserva eliminada exitosamente'
           };
        }
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
const confirmReservationByAdmin = async (id, token, amountPaid) => {
  const response = await axios.patch(
    `${BASE_URL}/${id}/confirm`,
    { amountPaid }, // Enviar el monto pagado en el cuerpo de la solicitud
    getHeaders(token)
  );

  if (response.status === 200) {
    return response.data; // El backend debe devolver el nuevo total
  }

  throw new Error(response.data?.message || 'No se pudo confirmar la reserva');
};

const cancelReservationByAdmin = async (id, token) => {
  const response = await axios.patch(
    `${BASE_URL}/${id}/cancel`,
    { status: 'canceled' }, // cuerpo de la petición
    {
      ...getHeaders(token), // headers van como tercer argumento
      validateStatus: (status) => status < 500,
    }
  );
  if (response.status === 200) {
    return {
      success: true,
      data: response.data,
      message: 'Reserva cancelada exitosamente',
    };
  }
  return response.data;
};
const cancelReservationWithRefund = async (id, token) => {
  // Cambia el estado de la reserva a "cancelada" y procesa el reembolso
  const response = await axios.patch(
    `${BASE_URL}/${id}/cancel-with-refund`, 
    { status: 'canceled' }, // cuerpo de la petición
    {
      ...getHeaders(token),
      validateStatus: status => status < 500,
    }
  );
  if (response.status === 200) {
    return {
      success: true,
      data: response.data,
      message: 'Reserva cancelada y reembolso procesado',
    };
  }
  return {
    success: false,
    message: response.data?.message || 'No se pudo cancelar la reserva',
  };
};


export default {
  createReservation,
  updateReservationByAdmin,
  confirmReservationAfterPayment,
  getReservations,
  deleteReservation,
  confirmReservationByAdmin,
  cancelReservationByAdmin,
  cancelReservationWithRefund,
};
