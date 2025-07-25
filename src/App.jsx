import { Route, Routes, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import RoomForm from './components/RoomForm';
import RoomList from './components/RoomList';
import UserList from './components/UserList';
import ReservationList from './components/ReservationList';
import ReservationForm from './components/ReservationForm';
import { Auth0Provider } from '@auth0/auth0-react';
import ProtectedRoute from './components/ProtectedRoute';
import ReportsPage from './pages/ReportsPage';

const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

function App() {
  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: 'http://localhost:4000',
        audience: audience,
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
            <ProtectedRoute requiredRole="admin">
              <RoomForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/roomList"
          element={
            <ProtectedRoute requiredRole="admin">
              <RoomList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userList"
          element={
            <ProtectedRoute requiredRole="admin">
              <UserList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservationForm"
          element={
            <ProtectedRoute requiredRole="admin">
              <ReservationForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservationList"
          element={
            <ProtectedRoute requiredRole="admin">
              <ReservationList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute requiredRole="admin">
              <ReportsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Auth0Provider>
  );
}

export default App;
