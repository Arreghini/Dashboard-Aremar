import React, { useState } from 'react';
import roomService from '../services/roomService';

const RoomForm = () => {
  const [formData, setFormData] = useState({
    id: '',
    description: '',
    typeRoom: '',
    detailRoom: '',
    photoRoom: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await roomService.createRoom(formData);
      // Reset form after successful submission
      setFormData({
        id: '',
        description: '',
        typeRoom: '',
        detailRoom: '',
        photoRoom: '',
      });
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>Create New Room</h1>
      <label>
        ID:
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Description:
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </label>
      <label>
        Type Room:
        <input
          type="text"
          name="typeRoom"
          value={formData.typeRoom}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Detail Room:
        <input
          type="text"
          name="detailRoom"
          value={formData.detailRoom}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Photo Room:
        <input
          type="text"
          name="photoRoom"
          value={formData.photoRoom}
          onChange={handleChange}
        />
      </label>
      <button type="submit">Create Room</button>
    </form>
  );
};

export default RoomForm;