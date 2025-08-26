import { describe, test, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReservationList from '../ReservationList';

// ---- MOCK AUTH0 ----
vi.mock('@auth0/auth0-react', () => {
  return {
    Auth0Provider: ({ children }) => children,
    useAuth0: () => ({
      isAuthenticated: true,
      user: { name: 'Tester', email: 'tester@example.com' },
      getAccessTokenSilently: vi.fn().mockResolvedValue('fake-token'),
      loginWithRedirect: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

// ---- MOCK RESERVATION SERVICE ----
vi.mock('../../services/reservationService', () => ({
  default: {
    getReservations: vi.fn().mockResolvedValue([
      {
        id: 1,
        checkIn: '2025-08-24',
        checkOut: '2025-08-26',
        totalPrice: 200,
        amountPaid: 100,
        status: 'pending',
        room: { id: '101', roomType: { name: 'Doble' } },
        user: { name: 'Juan', email: 'juan@example.com' },
      },
    ]),
  },
}));

// --- Helper para encontrar tarjeta por nombre ---
async function findReservationCard(nombre) {
  const tarjeta = await screen.findByText(new RegExp(nombre, "i"));
  return tarjeta.closest("div"); // devuelve el contenedor de la tarjeta
}

describe("ReservationList", () => {
  const reservationsMock = [
    {
      id: 1,
      checkIn: '2025-08-24',
      checkOut: '2025-08-26',
      totalPrice: 200,
      amountPaid: 100,
      status: 'pending',
      room: { id: '101', roomType: { name: 'Doble' } },
      user: { name: 'Juan', email: 'juan@example.com' },
    },
  ];

  test("quita filtros al presionar Quitar", async () => {
    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /quitar/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /quitar/i }));

    expect(screen.getByText(/Lista de Reservas/)).toBeInTheDocument();
  });

  test("filtra reservas saldadas", async () => {
    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /saldados/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /saldados/i }));
  });

  test("filtra reservas pendientes", async () => {
    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /pendientes/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /pendientes/i }));
  });

  test("ordena por nombre", async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('Juan');

    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /por nombre/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /por nombre/i }));

    await waitFor(() => {
      expect(screen.getByText(/Juan/)).toBeInTheDocument();
    });
  });

  test("ordena por habitación", async () => {
    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /por habitación/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /por habitación/i }));
  });

  test("filtra reservas por rango de fechas", async () => {
  render(<ReservationList reservations={reservationsMock} />);

  // Ingresamos las fechas de filtro
  fireEvent.change(screen.getByLabelText(/desde/i), {
    target: { value: "2025-08-24" },
  });
  fireEvent.change(screen.getByLabelText(/hasta/i), {
    target: { value: "2025-08-24" },
  });

  fireEvent.click(screen.getByRole("button", { name: /aplicar/i }));

  // Suponiendo que la reserva de Juan tiene ID 1
  const tarjeta = await screen.findByTestId("reservation-card-1");

  // Comprobamos que contiene la fecha de check-in
  const fechaCheckIn = new Date("2025-08-24").toLocaleDateString();
  expect(tarjeta).toHaveTextContent(fechaCheckIn);

  // Opcional: comprobamos nombre del cliente
  expect(tarjeta).toHaveTextContent(/Juan/i);
});

});
