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
vi.mock('../../services/reservationService', () => {
  return {
    default: {
      getReservations: vi.fn().mockResolvedValue([
        {
          id: 1,
          guestName: 'Juan',
          startDate: '2025-08-24',
          endDate: '2025-08-26',
          room: '101',
          status: 'pendiente',
        },
      ]),
    },
  };
});

import reservationService from "../../services/reservationService";
import roomService from "../../services/roomService";
import roomClasifyService from "../../services/roomClasifyService";

describe("ReservationList", () => {

  test("filtra reservas por rango de fechas", async () => {
    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /aplicar/i })
    );

    fireEvent.change(screen.getByLabelText("Desde:"), {
      target: { value: "2025-08-24" },
    });
    fireEvent.change(screen.getByLabelText("Hasta:"), {
      target: { value: "2025-08-26" },
    });

    fireEvent.click(screen.getByRole("button", { name: /aplicar/i }));

    await waitFor(() => {
      expect(screen.getByText(/Juan/)).toBeInTheDocument();
      expect(
        screen.getByText((content) =>
          content.includes("2025-08-24") ||
          content.includes("8/24/2025") ||
          content.includes("24/8/2025")
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText((content) =>
          content.includes("2025-08-26") ||
          content.includes("8/26/2025") ||
          content.includes("26/8/2025")
        )
      ).toBeInTheDocument();
    }, { timeout: 2000 });
  });

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
    // Aquí podrías agregar un expect para validar solo saldadas
  });

  test("filtra reservas pendientes", async () => {
    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /pendientes/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /pendientes/i }));
    // Aquí podrías agregar un expect para validar solo pendientes
  });

  test("ordena por nombre", async () => {
    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /por nombre/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /por nombre/i }));
    // Validación ejemplo
  });

  test("ordena por habitación", async () => {
    render(<ReservationList />);

    await waitFor(() =>
      screen.getByRole("button", { name: /por habitación/i })
    );

    fireEvent.click(screen.getByRole("button", { name: /por habitación/i }));
    // Validación ejemplo
  });

});
