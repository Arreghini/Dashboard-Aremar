import React, { useState, useEffect } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomDetailForm = ({ onRoomDetailCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomDetailData, setRoomDetailData] = useState({
    cableTvService: false,
    smart_TV: false,
    wifi: true, 
    microwave: false,
    pava_electrica: false,
  });  

  const [detailId, setDetailId] = useState(null);
  const [details, setDetails] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const detailNames = {
    cableTvService: "TV por Cable",
    smart_TV: "Smart TV",
    wifi: "WiFi",
    microwave: "Microondas", 
    pava_electrica: "Pava Eléctrica"
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await roomClasifyService.getRoomDetail(token);
        console.log("Respuesta completa del servidor:", response);
        setDetails(response || []);
      } catch (error) {
        console.error('Error específico:', error.response);
      }
    };
    fetchDetails();
  }, [getAccessTokenSilently]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setRoomDetailData(prevData => ({
      ...prevData,
      [name]: checked || false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();
      let response;
  
      if (detailId) {
        await roomClasifyService.updateRoomDetail(detailId, roomDetailData, token);
        setDetails(details.map(detail => detail.id === detailId ? { ...detail, ...roomDetailData } : detail));
      } else {
        response = await roomClasifyService.createRoomDetail(roomDetailData, token);
        setDetails([...details, response.data]);
      }
  
      setRoomDetailData({
        cableTvService: false,
        smart_TV: false,
        wifi: true,  
        microwave: false,
        pava_electrica: false,
      });
      setDetailId(null);
  
      // Llama a la función de éxito, si existe
      if (onRoomDetailCreated) onRoomDetailCreated();
      
      setSuccessMessage('Detalle de habitación guardado con éxito');
      setError('');
    } catch (error) {
      console.error("Error completo:", error);
      setError('Error al guardar el detalle de habitación');
    }
  };

  const handleEdit = (id) => {
    const detail = details.find(detail => detail.id === id);
    if (detail) setRoomDetailData(detail);
    setDetailId(id);
  };  

  const handleDelete = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomDetail(id, token);
      setDetails(details.filter(detail => detail.id !== id));
      setSuccessMessage('Detalle de habitación eliminado con éxito');
      setRoomDetailData({
        cableTvService: false,
        smart_TV: false,
        wifi: true,
        microwave: false,
        pava_electrica: false,
      });
      setDetailId(null);
    } catch (error) {
      setError('Error al eliminar el detalle de habitación');
      console.error(error);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">{detailId ? 'Actualizar' : 'Crear'} Detalle de Habitación</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
      {Object.keys(detailNames).map((name) => (
  <label key={name} className="flex items-center mb-2">
    <input
      type="checkbox"
      name={name}
      checked={roomDetailData[name]}
      onChange={handleChange}
      className="mr-2"
    />
    {detailNames[name]}
  </label>
))}

        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
          {detailId ? 'Actualizar' : 'Crear'}
        </button>
      </form>

      <h2 className="text-lg font-bold mt-4">Detalles de Habitaciones</h2>
      {details.map((detail) => (
  <div key={detail.id} className="flex items-center justify-between mb-2 p-2 border rounded bg-gray-50">
    <div className="flex flex-wrap gap-2">
      {Object.entries(detail).map(([key, value]) => {
        if (key !== 'id' && value === true && detailNames[key]) {
          return (
            <span key={`${detail.id}-${key}`} className="bg-blue-100 px-2 py-1 rounded">
              {detailNames[key]}
            </span>
          );
        }
        return null;
      })}
    </div>
    <div>
      <button onClick={() => handleEdit(detail.id)} className="text-blue-500 mr-2">
        Editar
      </button>
      <button onClick={() => handleDelete(detail.id)} className="text-red-500">
        Eliminar
      </button>
    </div>
  </div>
))}
    </div>
  );
}

export default RoomDetailForm;
