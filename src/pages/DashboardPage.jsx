
import React from 'react';
import RoomList from '../components/RoomList';
import ReservationList from '../components/ReservationList';
import UserList from '../components/UserList';

const DashboardPage = () => {
  return (
    <div>
      <h1>Dashboard</h1>
      
      <h2>Users</h2>
      <UserList />
      
      <h3>Rooms</h3>
      <RoomList />
      
      <h4>Reservations</h4>
      <ReservationList />
    </div>
  );
};

export default DashboardPage;
