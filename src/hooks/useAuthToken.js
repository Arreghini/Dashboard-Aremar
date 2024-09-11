import { useAuth0 } from '@auth0/auth0-react';

const useAuthToken = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getToken = async () => {
    try {
      return await getAccessTokenSilently();
    } catch (error) {
      console.error('Error al obtener el token:', error);
      throw error;
    }
  };

  return { getToken };
};

export default useAuthToken;
