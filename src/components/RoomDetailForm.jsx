import React, { useState, useEffect } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomDetailForm = ({ onRoomDetailCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomDetailData, setRoomDetailData] = useState({
    cableTvService: false,
    smart_TV: false,
    wifi: false,
    microwave: false,
    pava_electrica : false,
  });
  const [detailId, setDetailId] = useState(null);
  const [details, setDetails] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = await getAccessTokenSilently();
        const fetchedDetails = await roomClasifyService.getRoomDetail(token);
        setDetails(fetchedDetails);
      } catch (error) {
        console.error('Error al obtener detalles:', error);
      }
    };
    fetchDetails();
  }, [getAccessTokenSilently]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getAccessTokenSilently();

      if (detailId) {
        // Actualización de un detalle existente
        await roomClasifyService.updateRoomDetail(detailId, roomDetailData, token);
        setSuccessMessage('Detalle de habitación actualizado con éxito');
      } else {
        // Creación de un nuevo detalle
        await roomClasifyService.createRoomDetail(roomDetailData, token);
        setSuccessMessage('Detalle de habitación creado con éxito');
      }

      setRoomDetailData({
        cableTvService: false,
        smart_TV: false,
        wifi: false,
        microwave: false,
        pava_electrica: false,
      });
      setDetailId(null);
      setError('');
      loadDetails(token);
      onRoomDetailCreated();
    } catch (error) {
      setError('Error al guardar el detalle de habitación');
      console.error(error);
    }
  };

  const handleEdit = (id, detailData) => {
    setDetailId(id);
    setRoomDetailData(detailData);
  };

  const handleDelete = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomDetail(id, token);
      setSuccessMessage('Detalle de habitación eliminado con éxito');
      setRoomDetailData({
        cableTvService: false,
        smart_TV: false,
        wifi: false,
        microwave: false,
        pava_electrica: false,
      });
      setDetailId(null);
      setError('');
      loadDetails(token);
      onRoomDetailCreated();
    } catch (error) {
      setError('Error al eliminar el detalle de habitación');
      console.error(error);
    }
  };

  const loadDetails = async (token) => {
    try {
      const fetchedDetails = await roomClasifyService.getRoomDetail(token);
      setDetails(fetchedDetails);
    } catch (error) {
      console.error('Error al cargar los detalles de habitación:', error);
    }
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setRoomDetailData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));
  };

  return (
    <div className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">{detailId ? 'Actualizar' : 'Crear'} Detalle de Habitación</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <form onSubmit={handleSubmit}>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            name="cableTvService"
            checked={roomDetailData.cableTvService}
            onChange={handleChange}
            className="mr-2"
          />
          Servicio de TV por cable
        </label>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            name="smart_TV"
            checked={roomDetailData.smart_TV}
            onChange={handleChange}
            className="mr-2"
          />
          Smart TV
        </label>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            name="wifi"
            checked={roomDetailData.wifi}
            onChange={handleChange}
            className="mr-2"
          />
          WiFi
        </label>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            name="microwave"
            checked={roomDetailData.microwave}
            onChange={handleChange}
            className="mr-2"
          />
          Microondas
        </label>
        <label className="flex items-center mb-2">
          <input
          type="checkbox"
          name="pava_electrica"
          checked={roomDetailData.pava_electrica}
          onChange={handleChange}
          className="mr-2"
          />
          Pava eléctrica
          </label>
        <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">
          {detailId ? 'Actualizar' : 'Crear'} Detalle
        </button>
      </form>
      <ul className="mt-4">
        {details.map((item) => (
          <li key={item.id} className="flex justify-between items-center border-b border-gray-300 p-2">
            <span>{item.cableTvService ? 'TV por cable, ' : ''}{item.smart_TV ? 'Smart TV, ' : ''}{item.wifi ? 'WiFi, ' : ''}{item.microwave ? 'Microondas' : ''}</span>
            <div>
              <button onClick={() => handleEdit(item.id, item)} className="text-blue-500 mr-2">Editar</button>
              <button onClick={() => handleDelete(item.id)} className="text-red-500">Eliminar</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default RoomDetailForm;
