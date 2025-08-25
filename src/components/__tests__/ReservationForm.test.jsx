// import { describe, test, expect, vi } from "vitest";
// import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
// import ReservationForm from "../ReservationForm";

// // ---- MOCK AUTH0 ----
// vi.mock("@auth0/auth0-react", () => ({
//   Auth0Provider: ({ children }) => children,
//   useAuth0: () => ({
//     isAuthenticated: true,
//     user: { sub: "123", name: "Tester", ["https://aremar.com/roles"]: ["admin"] },
//     getAccessTokenSilently: vi.fn(() => Promise.resolve("fake-token")),
//     loginWithRedirect: vi.fn(),
//     logout: vi.fn(),
//   }),
// }));

// // ---- MOCK SERVICES ----
// vi.mock("../services/userService", () => ({
//   default: {
//     getUsers: vi.fn(() =>
//       Promise.resolve([
//         { id: "u1", name: "Juan" },
//         { id: "u2", name: "Ana" },
//       ])
//     ),
//   },
// }));

// vi.mock("../services/roomService", () => ({
//   default: {
//     getRoomTypes: vi.fn(() =>
//       Promise.resolve([
//         { id: "r1", name: "Simple" },
//         { id: "r2", name: "Doble" },
//       ])
//     ),
//     getAvailableRoomsByType: vi.fn(() =>
//       Promise.resolve({
//         rooms: [
//           { id: "101", description: "Simple con vista al mar" },
//           { id: "102", description: "Simple interior" },
//         ],
//       })
//     ),
//   },
// }));

// vi.mock("../services/reservationService", () => ({
//   default: {
//     createReservation: vi.fn(() => Promise.resolve({ success: true })),
//   },
// }));

// describe("ReservationForm", () => {
//   test("crea una reserva correctamente como admin", async () => {
//     const onClose = vi.fn();
//     const onSave = vi.fn();

//     // Renderizar
//     await act(async () => {
//       render(<ReservationForm onClose={onClose} onSave={onSave} />);
//     });

//     // Esperar a que carguen usuarios y tipos de habitación
//     await waitFor(() => screen.getByText("Seleccione un usuario"));
//     await waitFor(() => screen.getByText("Seleccione un tipo"));

//     // Seleccionar usuario
//     await act(async () => {
//       fireEvent.change(screen.getByLabelText("Usuario"), { target: { value: "u1" } });
//     });

//     // Seleccionar tipo de habitación
//     await act(async () => {
//       fireEvent.change(screen.getByLabelText("Tipo de Habitación"), { target: { value: "r1" } });
//     });

//     // Fechas
//     await act(async () => {
//       fireEvent.change(screen.getByLabelText("Fecha de Ingreso"), { target: { value: "2025-08-24" } });
//       fireEvent.change(screen.getByLabelText("Fecha de Egreso"), { target: { value: "2025-08-26" } });
//     });

//     // Cantidad de huéspedes
//     await act(async () => {
//       fireEvent.change(screen.getByLabelText("Cantidad de Huéspedes"), { target: { value: "2" } });
//     });

//     // Esperar habitaciones disponibles
//     await waitFor(() => screen.getByText("101 - Simple con vista al mar"));

//     // Seleccionar habitación
//     await act(async () => {
//       fireEvent.change(screen.getByLabelText("Habitación Disponible"), { target: { value: "101" } });
//     });

//     // Guardar reserva
//     await act(async () => {
//       fireEvent.click(screen.getByRole("button", { name: /guardar/i }));
//     });

//     // Comprobaciones finales
//     await waitFor(() => {
//       const reservationService = require("../services/reservationService").default;
//       expect(reservationService.createReservation).toHaveBeenCalledOnce();
//       expect(onSave).toHaveBeenCalled();
//       expect(onClose).toHaveBeenCalled();
//     });
//   });
// });
