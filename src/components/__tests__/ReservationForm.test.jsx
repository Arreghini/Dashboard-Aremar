import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReservationForm from "../ReservationForm.jsx";
import { useAuth0 } from "@auth0/auth0-react";
import userService from "../../services/userService";
import roomService from "../../services/roomService";
import reservationService from "../../services/reservationService";

// Mocks
vi.mock("@auth0/auth0-react");
vi.mock("../../services/userService");
vi.mock("../../services/roomService");
vi.mock("../../services/reservationService");

describe("ReservationForm", () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    useAuth0.mockReturnValue({
      user: { sub: "user123", name: "Juan", "https://aremar.com/roles": ["admin"] },
      getAccessTokenSilently: vi.fn().mockResolvedValue("mock-token"),
    });

    userService.getUsers.mockResolvedValue([
      { id: "u1", name: "Usuario 1" },
      { id: "u2", name: "Usuario 2" },
    ]);

    roomService.getRoomTypes.mockResolvedValue([
      { id: "rt1", name: "Doble" },
      { id: "rt2", name: "Suite" },
    ]);

    roomService.getAvailableRoomsByType.mockResolvedValue({
      rooms: [{ id: "r1", description: "Habitación 1" }],
    });

    reservationService.createReservation.mockResolvedValue({});
  });

  it("renderiza correctamente el formulario y campos de admin", async () => {
    render(<ReservationForm onClose={mockOnClose} onSave={mockOnSave} />);

    // Espera a que se carguen usuarios y tipos de habitación
    await waitFor(() => {
      expect(userService.getUsers).toHaveBeenCalled();
      expect(roomService.getRoomTypes).toHaveBeenCalled();
    });

    // Campos básicos
    expect(screen.getByText("Crear Nueva Reserva")).toBeInTheDocument();
    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Tipo de Habitación")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha de Ingreso")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha de Egreso")).toBeInTheDocument();
    expect(screen.getByLabelText("Cantidad de Huéspedes")).toBeInTheDocument();
  });

  it("permite seleccionar datos y envía la reserva correctamente", async () => {
    render(<ReservationForm onClose={mockOnClose} onSave={mockOnSave} />);

    const userSelect = await screen.findByLabelText("Usuario");
    fireEvent.change(userSelect, { target: { value: "u1" } });

    const roomTypeSelect = screen.getByLabelText("Tipo de Habitación");
    fireEvent.change(roomTypeSelect, { target: { value: "rt1" } });

    const checkInInput = screen.getByLabelText("Fecha de Ingreso");
    const checkOutInput = screen.getByLabelText("Fecha de Egreso");
    const numberGuestsInput = screen.getByLabelText("Cantidad de Huéspedes");

    fireEvent.change(checkInInput, { target: { value: "2025-09-01" } });
    fireEvent.change(checkOutInput, { target: { value: "2025-09-03" } });
    fireEvent.change(numberGuestsInput, { target: { value: "2" } });

    // Esperar a que se carguen habitaciones disponibles
    await waitFor(() => {
      expect(roomService.getAvailableRoomsByType).toHaveBeenCalled();
    });

    const roomSelect = screen.getByLabelText("Habitación Disponible");
    fireEvent.change(roomSelect, { target: { value: "r1" } });

    const saveButton = screen.getByRole("button", { name: "Guardar" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(reservationService.createReservation).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it("muestra mensaje de alerta si checkOut es antes que checkIn", async () => {
    global.alert = vi.fn();

    render(<ReservationForm onClose={mockOnClose} onSave={mockOnSave} />);

    const checkInInput = screen.getByLabelText("Fecha de Ingreso");
    const checkOutInput = screen.getByLabelText("Fecha de Egreso");

    fireEvent.change(checkInInput, { target: { value: "2025-09-03" } });
    fireEvent.change(checkOutInput, { target: { value: "2025-09-01" } });

    const saveButton = screen.getByRole("button", { name: "Guardar" });
    fireEvent.click(saveButton);

    expect(global.alert).toHaveBeenCalledWith(
      "La fecha de egreso debe ser posterior a la de ingreso."
    );
  });

  it("muestra mensaje si no hay habitaciones disponibles", async () => {
    roomService.getAvailableRoomsByType.mockResolvedValueOnce({ rooms: [] });

    render(<ReservationForm onClose={mockOnClose} onSave={mockOnSave} />);

    fireEvent.change(screen.getByLabelText("Tipo de Habitación"), { target: { value: "rt1" } });
    fireEvent.change(screen.getByLabelText("Fecha de Ingreso"), { target: { value: "2025-09-01" } });
    fireEvent.change(screen.getByLabelText("Fecha de Egreso"), { target: { value: "2025-09-03" } });

    await waitFor(() => {
      expect(screen.getByText(/No hay habitaciones disponibles/i)).toBeInTheDocument();
    });
  });
});
