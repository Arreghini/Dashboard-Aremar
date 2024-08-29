import { Route, Routes, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RoomForm from './components/RoomForm';
import RoomList from './components/RoomList';
import UserList from './components/UserList';
import ReservationList from './components/ReservationList';
import ReservationForm from './components/ReservationForm';
import { Auth0Provider } from '@auth0/auth0-react';
import ProtectedRoute from './components/ProtectedRoute';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;

function App() {
  return (
    <Auth0Provider
  domain={domain}
  clientId={clientId}
  authorizationParams={{
    redirect_uri: 'http://localhost:4000',
  }}
>

      <Routes>
        {/* Ruta por defecto que redirige al dashboard si está autenticado */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Define rutas individuales */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <DashboardPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roomForm" 
          element={
            <ProtectedRoute>
              <RoomForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/roomList" 
          element={
            <ProtectedRoute>
              <RoomList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/userList" 
          element={
            <ProtectedRoute>
              <UserList />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservationForm" 
          element={
            <ProtectedRoute>
              <ReservationForm />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/reservationList" 
          element={
            <ProtectedRoute>
              <ReservationList />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Auth0Provider>
  );
}

export default App;
