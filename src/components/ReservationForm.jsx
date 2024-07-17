import React, { useState, useEffect } from 'react';
import reservationService from '../services/reservationService';
import roomService from '../services/roomService';
import userService from '../services/userService';

const ReservationForm = ({ reservation = {}, onSave }) => {
  const [formData, setFormData] = useState({
    id: reservation.id || '',
    userId: reservation.userId || '',
    roomId: reservation.roomId || '',
    guests: reservation.guests || '',
    checkInDate: reservation.checkInDate || '',
    checkOutDate: reservation.checkOutDate || '',
    totalPrice: reservation.totalPrice || '',
    status: reservation.status || 'pending',
  });

  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      const data = await roomService.getRooms();
      setRooms(data);
    };

    const fetchUsers = async () => {
      const data = await userService.getUsers();
      setUsers(data);
    };

    fetchRooms();
    fetchUsers();
  }, []);

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
      if (formData.id) {
        await reservationService.updateReservation(formData.id, formData);
      } else {
        await reservationService.createReservation(formData);
      }
      onSave();
    } catch (error) {
      console.error('Error saving reservation:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1>{formData.id ? 'Edit Reservation' : 'Create Reservation'}</h1>
      <label>
        User:
        <select
          name="userId"
          value={formData.userId}
          onChange={handleChange}
          required
        >
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Room:
        <select
          name="roomId"
          value={formData.roomId}
          onChange={handleChange}
          required
        >
          <option value="">Select Room</option>
          {rooms.map(room => (
            <option key={room.id} value={room.id}>
              {room.description}
            </option>
          ))}
        </select>
      </label>
      <label>
        Guests:
        <input
          type="number"
          name="guests"
          value={formData.guests}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Check-in Date:
        <input
          type="date"
          name="checkInDate"
          value={formData.checkInDate}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Check-out Date:
        <input
          type="date"
          name="checkOutDate"
          value={formData.checkOutDate}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Total Price:
        <input
          type="number"
          name="totalPrice"
          value={formData.totalPrice}
          onChange={handleChange}
          required
        />
      </label>
      <label>
        Status:
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </label>
      <button type="submit">{formData.id ? 'Update Reservation' : 'Create Reservation'}</button>
    </form>
  );
};

export default ReservationForm;
