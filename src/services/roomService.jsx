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
        roomTypeId: roomData.roomTypeId || roomData.roomType,
        detailRoomId: roomData.roomDetailId || roomData.roomDetail, // Cambiamos a detailRoomId
        price: parseInt(roomData.price),
        status: roomData.status || 'available',
        photoRoom: roomData.photoRoom || '',
    };

    try {
        const response = await axios.post(
            `${BASE_URL}/admin`, 
            roomPayload, 
            getHeaders(token)
        );
        console.log('Datos enviados:', roomPayload);
        return response.data;
    } catch (error) {
        console.log('Datos que causaron el error:', roomPayload);
        console.log('Respuesta del servidor:', error.response?.data);
        throw error;
    }
},



  updateRoom: async (id, roomData, token) => {
    const roomPayload = {
      id: roomData.id,
      description: roomData.description,
      roomType: roomData.roomType,
      roomDetail: roomData.roomDetail,
      price: roomData.price,
      status: roomData.status,
      photoRoom: roomData.photoRoom,
    };

    try {
      const response = await axios.patch(`${BASE_URL}/admin/${id}`, roomPayload, getHeaders(token));
      console.log('Datos enviados en la actualización:', roomPayload);
      console.log('Respuesta del servidor al actualizar:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar la habitación:', error);
      console.log('Detalles del error:', error.response?.data);
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
