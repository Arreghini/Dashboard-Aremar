export const useAuth0 = () => {
  return {
    isAuthenticated: true,
    isLoading: false,
    user: {
      email: "testuser@example.com",
      name: "Test User",
      sub: "auth0|123456",
    },
    loginWithRedirect: vi.fn(),
    logout: vi.fn(),
  };
};
