import { render, screen, fireEvent, within } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardPage from '../DashboardPage';

// 👉 Mock de Auth0
vi.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: {
      name: 'Admin Test',
      email: 'admin@test.com',
      'https://aremar.com/roles': ['Administrador'],
    },
  }),
}));

// 👉 Mock de componentes pesados para simplificar
vi.mock('../../components/UserList', () => ({ default: () => <div>Mock UserList</div> }));
vi.mock('../../components/UserForm', () => ({ default: () => <div>Mock UserForm</div> }));
vi.mock('../../components/RoomForm', () => ({ default: () => <div>Mock RoomForm</div> }));
vi.mock('../../components/RoomList', () => ({ default: () => <div>Mock RoomList</div> }));
vi.mock('../../components/ReservationForm', () => ({ default: () => <div>Mock ReservationForm</div> }));
vi.mock('../../components/ReservationList', () => ({ default: () => <div>Mock ReservationList</div> }));
vi.mock('../../components/RoomTypeForm', () => ({ default: () => <div>Mock RoomTypeForm</div> }));
vi.mock('../../components/RoomDetailForm', () => ({ default: () => <div>Mock RoomDetailForm</div> }));
vi.mock('../../components/RoomTypeList', () => ({ default: () => <div>Mock RoomTypeList</div> }));
vi.mock('../../components/ChatIA', () => ({ default: () => <div>Mock ChatIA</div> }));
vi.mock('../ReportsPage', () => ({
  __esModule: true,
  default: () => <div>Mock ReportsPage</div>,
}));

describe('DashboardPage', () => {
  test('renderiza correctamente con usuario y modo claro', () => {
    render(<DashboardPage />);

    // Header
    expect(screen.getByText(/dashboard del administrador/i)).toBeInTheDocument();

    // Sección usuario
    const userSection = screen.getByText(/bienvenido, admin test/i).parentElement;
    expect(within(userSection).getByText(/bienvenido, admin test/i)).toBeInTheDocument();
    expect(within(userSection).getByText(/admin@test.com/i)).toBeInTheDocument();
    expect(within(userSection).getByText(/administrador/i)).toBeInTheDocument();

    // Botón modo oscuro
    expect(screen.getByRole('button', { name: /modo oscuro/i })).toBeInTheDocument();
  });

  test('cambia entre modo claro y modo oscuro', () => {
    render(<DashboardPage />);

    const toggleButton = screen.getByRole('button', { name: /modo oscuro/i });
    fireEvent.click(toggleButton);

    expect(screen.getByRole('button', { name: /modo claro/i })).toBeInTheDocument();
  });

  test('muestra y oculta la lista de usuarios', () => {
    render(<DashboardPage />);

    const toggleUsuarios = screen.getByRole('button', { name: /lista de usuarios/i });
    fireEvent.click(toggleUsuarios);

    expect(screen.getByText(/mock userlist/i)).toBeInTheDocument();

    fireEvent.click(toggleUsuarios);
    expect(screen.queryByText(/mock userlist/i)).not.toBeInTheDocument();
  });

  test('abre la sección de reportes', () => {
    render(<DashboardPage />);

    const toggleReportes = screen.getByRole('button', { name: /reportes/i });
    fireEvent.click(toggleReportes);

    expect(screen.getByText(/mock reportspage/i)).toBeInTheDocument();
  });
});
