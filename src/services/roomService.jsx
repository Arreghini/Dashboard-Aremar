import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/rooms/admin';

const getHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

const roomService = {
  getRoom: async (id, token) => {
    try {
      const response = await axios.get(`${BASE_URL}/${id}`, getHeaders(token));
      return response.data;
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error al obtener la habitación:', error);
      }
      throw error;
    }
  },

  getRooms: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/all`, getHeaders(token));
      if (Array.isArray(response.data)) {
        return response.data;
      } else {
        console.log('La respuesta no es un array de habitaciones');
        return [];
      }
    } catch (error) {
      console.error('Error al obtener las habitaciones:', error);
      throw error;
    }
  },

  createRoom: async (roomData, token) => {
    try {
      console.log('=== DEBUG CREATEROOM ===');
      console.log('Datos recibidos:', roomData);

      if (roomData instanceof FormData) {
        console.log('⚠️ FormData detectado, pero enviando como JSON...');
        return;
      }

      const roomPayload = {
        id: roomData.id,
        description: roomData.description,
        roomTypeId: roomData.roomTypeId,
        price: Number(roomData.price),
        status: roomData.status,
        photoRoom: Array.isArray(roomData.photoRoom) ? roomData.photoRoom : [],
      };

      console.log('Payload final enviado:', roomPayload);

      const response = await axios.post(
        `${BASE_URL}`,
        roomPayload,
        getHeaders(token)
      );
      return response.data;
    } catch (error) {
      console.error('Error en createRoom:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  updateRoom: async (id, formData, token) => {
    try {
      const response = await axios.patch(`${BASE_URL}/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Error en la actualización:', error);
      throw error;
    }
  },

  deleteRoom: async (id, token) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`, getHeaders(token));
      console.log('Habitación eliminada con éxito');
    } catch (error) {
      console.error('Error al eliminar la habitación:', error);
      throw error;
    }
  },

  getRoomTypes: async (token) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/roomType`,
        getHeaders(token)
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener los tipos de habitaciones:', error);
      throw error;
    }
  },

  getRoomTypeById: async (id, token) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/rooms/${id}`,
        getHeaders(token)
      );
      return response.data;
    } catch (error) {
      console.error('Error al obtener el tipo de habitación:', error);
      throw error;
    }
  },

  getAvailableRoomsByType: async (
    token,
    reservationId,
    roomTypeId,
    checkIn,
    checkOut,
    numberOfGuests
  ) => {
    try {
      const response = await axios.get(`${BASE_URL}/available`, {
        params: {
          reservationId,
          roomTypeId,
          checkIn: checkIn,
          checkOut: checkOut,
          numberOfGuests,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener habitaciones disponibles:', error);
      throw error;
    }
  },

  createRoomWithDetails: async (formData, token) => {
    try {
      console.log('=== DEBUG createRoomWithDetails ===');
      console.log('Enviando FormData al backend...');

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await axios.post(`${BASE_URL}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Respuesta exitosa:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en createRoomWithDetails:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // 🔧 USAR FETCH PARA VERIFICACIÓN SILENCIOSA (no aparece en consola)
  checkRoomIdAvailability: async (id, token) => {
    try {
      const response = await fetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Status 200: la habitación existe
        return { exists: true, available: false };
      } else if (response.status === 404) {
        // Status 404: ID disponible
        return { exists: false, available: true };
      } else {
        // Otros errores
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Solo mostrar errores que NO sean de red (fetch no muestra 404 en consola)
      if (!error.message.includes('404')) {
        console.error('Error al verificar disponibilidad del ID:', error);
      }
      throw error;
    }
  },

  // Agregar este método
  createRoomWithFormData: async (formData, token) => {
    try {
      console.log('=== DEBUG createRoomWithFormData ===');

      for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
      }

      const response = await axios.post(`${BASE_URL}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Habitación creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error en createRoomWithFormData:', error);
      throw error;
    }
  },
};

export default roomService;
