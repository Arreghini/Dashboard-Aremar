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
      console.error('Error al obtener la habitación:', error);
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

  getRoomsTypes: async (token) => {
    try {
      const response = await axios.get(`${BASE_URL}/roomType`, getHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Error al obtener los tipos de habitaciones:', error);
      throw error;
    }
  },

  createRoom: async (roomData, token) => {
    const roomPayload = {
      id: roomData.id,
      description: roomData.description,
      roomTypeId: roomData.roomTypeId,
      roomDetailId: roomData.roomDetailId,
      price: Number(roomData.price),
      status: roomData.status,
      photoRoom: Array.isArray(roomData.photoRoom) ? roomData.photoRoom : [],
    };

    try {
      const response = await axios.post(`${BASE_URL}`, roomPayload, getHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Error en createRoom:', error);
      throw error;
    }
  },

  updateRoom: async (id, roomData, token) => {
    const roomPayload = {
      description: roomData.description,
      roomTypeId: roomData.roomTypeId,
      detailRoomId: roomData.detailRoomId || roomData.roomDetailId,
      price: Number(roomData.price),
      status: roomData.status,
      photoRoom: Array.isArray(roomData.photoRoom) ? roomData.photoRoom : [],
    };

    try {
      const response = await axios.patch(`${BASE_URL}/${id}`, roomPayload, getHeaders(token));
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
      const response = await axios.get(`${BASE_URL}/roomType`, getHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Error al obtener los tipos de habitaciones:', error);
      throw error;
    }
  },
  getRoomTypeById: async (id, token) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/rooms/${id}`, getHeaders(token));
      return response.data;
    } catch (error) {
      console.error('Error al obtener el tipo de habitación:', error);
      throw error;
    }
  },  
  getAvailableRoomsByType: async (reservationId, roomTypeId, checkInDate, checkOutDate, numberOfGuests, token) => {
    const params = {
      reservationId,
      roomTypeId,
      checkInDate: new Date(checkInDate).toISOString().split('T')[0],
      checkOutDate: new Date(checkOutDate).toISOString().split('T')[0],
      numberOfGuests: parseInt(numberOfGuests, 10),
    };

    try {
      const response = await axios.get(`${BASE_URL}/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        params,
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener habitaciones disponibles:', error);
      throw error;
    }
  },
};

export default roomService;
