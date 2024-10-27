import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/rooms';

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
      throw error;
    }
  },

  getRooms: async () => {
    try {
      const response = await axios.get(`${BASE_URL}/all`);
      console.log('Respuesta del servidor:', response.data);
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
      console.log('token enviado al back:', token)
      const response = await axios.post(`${BASE_URL}/admin`, roomData, getHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Error al crear la habitación:', error);
      throw error;
    }
  },

  updateRoom: async (id, roomData, token) => {
    try {
      const response = await axios.patch(`${BASE_URL}/${id}`, roomData, getHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la habitación:', error);
      throw error;
    }
  },

  deleteRoom: async (id, token) => {
    try {
      await axios.delete(`${BASE_URL}/${id}`, getHeaders(token));
    } catch (error) {
      console.error('Error al eliminar la habitación:', error);
      throw error;
    }
  },
};

export default roomService;
