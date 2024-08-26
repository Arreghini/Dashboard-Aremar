import { Route, Routes } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RoomForm from './components/RoomForm';
import RoomList from './components/RoomList';
import UserList from './components/UserList';
import ReservationList from './components/ReservationList';
import ReservationForm from './components/ReservationForm';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: 'http://localhost:5173',
      }}
    >
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/roomForm" element={<RoomForm />} />
        <Route path="/roomList" element={<RoomList />} />
        <Route path="/userList" element={<UserList />} />
        <Route path="/reservationForm" element={<ReservationForm />} />
        <Route path="/reservationList" element={<ReservationList />} />
      </Routes>
    </Auth0Provider>
  );
}

export default App;
