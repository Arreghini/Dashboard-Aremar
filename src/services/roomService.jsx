import axios from 'axios';

const roomService = {
  getRooms: async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/rooms', {
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener las habitaciones:', error);
      throw error;
    }
  },

  getRoom: async (id) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/rooms/${id}`, {
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener la habitación:', error);
      throw error;
    }
  },

  createRoom: async (roomData, token) => {
    try {
      const response = await axios.post('http://localhost:3000/api/rooms', roomData, {
        headers: {
          Authorization: `Bearer ${token}`,  // Incluye el token en el encabezado
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear la habitación:', error);
      throw error;
    }
  },

  updateRoom: async (id, roomData, token) => {
    try {
      const response = await axios.patch(`http://localhost:3000/api/rooms/${id}`, roomData, {
        headers: {
          Authorization: `Bearer ${token}`,  // Incluye el token en el encabezado
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la habitación:', error);
      throw error;
    }
  },

  deleteRoom: async (id, token) => {
    try {
      await axios.delete(`http://localhost:3000/api/rooms/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`  // Incluye el token en el encabezado
        }
      });
    } catch (error) {
      console.error('Error al eliminar la habitación:', error);
      throw error;
    }
  }
};

export default roomService;
