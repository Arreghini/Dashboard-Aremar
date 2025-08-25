import { expect, test as it, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "../ProtectedRoute";
import { vi } from "vitest";
import { useAuth0 } from "@auth0/auth0-react";

// Mock de Auth0
vi.mock("@auth0/auth0-react", () => ({
  useAuth0: vi.fn(),
}));

describe("ProtectedRoute", () => {
  it("muestra 'Loading...' cuando isLoading es true", () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      user: null,
    });

    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renderiza los children si el usuario está autenticado y es admin", () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { "https://aremar.com/roles": ["admin"] },
    });

    render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });

  it("no renderiza nada si el usuario está autenticado pero no es admin", () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      user: { "https://aremar.com/roles": ["user"] },
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("no renderiza nada si el usuario no está autenticado", () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      user: null,
    });

    const { container } = render(
      <ProtectedRoute>
        <div>Contenido protegido</div>
      </ProtectedRoute>
    );

    expect(container).toBeEmptyDOMElement();
  });
});
