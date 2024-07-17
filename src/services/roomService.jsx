import axios from 'axios';

const getRooms = async () => {
  const response = await axios.get('/api/rooms');
  return response.data;
};

const getRoom = async (id) => {
  const response = await axios.get(`/api/rooms/${id}`);
  return response.data;
};

const createRoom = async (roomData) => {
  const response = await axios.post('/api/rooms', roomData);
  return response.data;
};

const updateRoom = async (id, roomData) => {
  const response = await axios.put(`/api/rooms/${id}`, roomData);
  return response.data;
};

const deleteRoom = async (id) => {
  const response = await axios.delete(`/api/rooms/${id}`);
  return response.data;
};

export default {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
};
