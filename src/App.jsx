import React from 'react';
import { Route, Routes, BrowserRouter as Router, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ReservationForm from './components/ReservationForm';
import ReservationList from './components/ReservationList';
import RoomForm from './components/RoomForm';
import RoomList from './components/RoomList';
import UserList from './components/UserList';
import { initializeIcons } from '@fluentui/font-icons-mdl2'; 

initializeIcons();

function MainLayout() {
  const location = useLocation();
  return (
    <>
      <Routes location={location}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/roomForm" element={<RoomForm />} />
        <Route path="/roomList" element={<RoomList />} />
        <Route path="/userList" element={<UserList />} />
        <Route path="/reservationForm" element={<ReservationForm />} />
        <Route path="/reservationList" element={<ReservationList />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <MainLayout />
    </Router>
  );
}

export default App;
