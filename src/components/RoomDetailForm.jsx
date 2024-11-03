import React, { useState, useEffect } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomDetailForm = ({ onRoomDetailCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [detail, setDetail] = useState('');
  const [detailId, setDetailId] = useState(null); // Estado para el ID del detalle a editar
  const [details, setDetails] = useState([]); // Estado para la lista de detalles
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Cargar los detalles existentes al montar el componente
    const fetchDetails = async () => {
      try {
        const fetchedDetails = await roomClasifyService.getRoomDetail();
        setDetails(fetchedDetails);
      } catch (error) {
        console.error('Error al obtener detalles:', error);
      }
    };
    fetchDetails();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();

      if (detailId) {
        // Si hay un ID, estamos actualizando un detalle existente
        await roomClasifyService.updateRoomDetail(detailId, { detail }, token);
        setSuccessMessage('Detalle de habitación actualizado con éxito');
      } else {
        // Si no hay ID, estamos creando un nuevo detalle
        await roomClasifyService.createRoomDetail({ detail }, token);
        setSuccessMessage('Detalle de habitación creado con éxito');
      }
      
      setDetail('');
      setDetailId(null);
      setError('');
      onRoomDetailCreated();
      loadDetails(); // Refresca la lista de detalles después de crear o actualizar

    } catch (error) {
      setError('Error al guardar el detalle de habitación');
    }
  };

  const handleEdit = (id, detailText) => {
    setDetailId(id);
    setDetail(detailText);
  };

  const handleDelete = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomDetail(id, token);
      setSuccessMessage('Detalle de habitación eliminado con éxito');
      setDetail('');
      setDetailId(null);
      setError('');
      onRoomDetailCreated();
      loadDetails(); // Refresca la lista de detalles después de eliminar
    } catch (error) {
      setError('Error al eliminar el detalle de habitación');
    }
  };

  const loadDetails = async () => {
    const fetchedDetails = await roomClasifyService.getRoomDetail();
    setDetails(fetchedDetails);
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">{detailId ? 'Actualizar' : 'Crear'} Detalle de Habitación</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="Detalle de habitación"
          required
          className="border border-gray-300 p-2 w-full"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">
          {detailId ? 'Actualizar' : 'Crear'} Detalle
        </button>
      </form>
      <ul className="mt-4">
        {details.map((item) => (
          <li key={item.id} className="flex justify-between items-center border-b border-gray-300 p-2">
            <span>{item.detail}</span>
            <div>
              <button onClick={() => handleEdit(item.id, item.detail)} className="text-blue-500 mr-2">Editar</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-500">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomDetailForm;
