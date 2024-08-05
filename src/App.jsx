import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ReservationForm from './components/ReservationForm';
import ReservationList from './components/ReservationList';
import RoomForm from './components/RoomForm';
import RoomList from './components/RoomList';
import UserList from './components/UserList';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import LoginPage from './components/LoginPage';
import { Auth0Provider } from '@auth0/auth0-react';

initializeIcons();

function MainLayout() {
  const location = useLocation();
  return (
    <Routes location={location}>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/roomForm" element={<RoomForm />} />
      <Route path="/roomList" element={<RoomList />} />
      <Route path="/userList" element={<UserList />} />
      <Route path="/reservationForm" element={<ReservationForm />} />
      <Route path="/reservationList" element={<ReservationList />} />
    </Routes>
  );
}

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <MainLayout />
    </Auth0Provider>
  );
}

export default App;
