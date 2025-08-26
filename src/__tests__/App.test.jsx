import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App.jsx';
import { vi } from 'vitest';

// === MOCKS ===
vi.mock('../pages/DashboardPage', () => ({
  __esModule: true,
  default: () => <div>DashboardPage Mock</div>,
}));

vi.mock('../pages/ReportsPage', () => ({
  __esModule: true,
  default: () => <div>ReportsPage Mock</div>,
}));

vi.mock('../components/RoomForm', () => ({
  __esModule: true,
  default: () => <div>RoomForm Mock</div>,
}));

vi.mock('../components/RoomList', () => ({
  __esModule: true,
  default: () => <div>RoomList Mock</div>,
}));

vi.mock('../components/UserList', () => ({
  __esModule: true,
  default: () => <div>UserList Mock</div>,
}));

vi.mock('../components/ReservationForm', () => ({
  __esModule: true,
  default: () => <div>ReservationForm Mock</div>,
}));

vi.mock('../components/ReservationList', () => ({
  __esModule: true,
  default: () => <div>ReservationList Mock</div>,
}));

vi.mock('../components/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

// === TESTS ===
describe('Rutas de App', () => {
  const routes = [
    { path: '/dashboard', text: /DashboardPage Mock/i },
    { path: '/reports', text: /ReportsPage Mock/i },
    { path: '/roomForm', text: /RoomForm Mock/i },
    { path: '/roomList', text: /RoomList Mock/i },
    { path: '/userList', text: /UserList Mock/i },
    { path: '/reservationForm', text: /ReservationForm Mock/i },
    { path: '/reservationList', text: /ReservationList Mock/i },
  ];

  routes.forEach(({ path, text }) => {
    it(`ruta ${path} renderiza el componente correcto`, () => {
      render(
        <MemoryRouter initialEntries={[path]}>
          <App />
        </MemoryRouter>
      );
      expect(screen.getByText(text)).toBeInTheDocument();
    });
  });

  it('ruta / redirige a /dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    expect(screen.getByText(/DashboardPage Mock/i)).toBeInTheDocument();
  });
});
