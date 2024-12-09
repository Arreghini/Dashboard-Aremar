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
        const response = await axios.get(`${BASE_URL}/admin/${id}`, getHeaders(token));
        return response.data;
    } catch (error) {
        console.error('Error al obtener la habitación:', error);
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
    const roomPayload = {
        id: roomData.id,
        description: roomData.description,
        roomTypeId: roomData.roomTypeId,
        roomDetailId: roomData.roomDetailId,
        price: Number(roomData.price), // Usamos el precio modificado
        status: roomData.status,
        photoRoom: Array.isArray(roomData.photoRoom) ? roomData.photoRoom : []
    };

    try {
        const response = await axios.post(
            `${BASE_URL}/admin`,
            roomPayload,
            getHeaders(token)
        );
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
    price: Number(roomData.price), // Usamos el precio modificado
    status: roomData.status,
    photoRoom: Array.isArray(roomData.photoRoom) ? roomData.photoRoom : []
  };

  try {
    const response = await axios.patch(
      `${BASE_URL}/admin/${id}`, 
      roomPayload, 
      getHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error('Error en la actualización:', error);
    throw error;
  }
},

  deleteRoom: async (id, token) => {
    try {
      await axios.delete(`${BASE_URL}/admin/${id}`, getHeaders(token));
      console.log('Habitación eliminada con éxito');
    } catch (error) {
      console.error('Error al eliminar la habitación:', error);
      throw error;
    }
  },
};

export default roomService;
