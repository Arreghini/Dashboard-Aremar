import { useState, useEffect } from 'react';
import roomService from '../services/roomService';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomForm = ({ room = {}, onSave }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    id: room?.id || '',
    description: room?.description || '',
    roomTypeId: room?.roomTypeId || '',
    detailRoomId: room?.detailRoomId || '',
    photoRoom: room?.photoRoom || '',
    status: room?.status || 'available',
    price: room?.price || 0,
  });
  const [roomTypes, setRoomTypes] = useState([]);
  const [roomDetails, setRoomDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently();
        const types = await roomClasifyService.getRoomType(token);
        const details = await roomClasifyService.getRoomDetail(token);
  
        // Si estamos editando, buscamos el tipo de habitación correspondiente
        if (room?.roomTypeId) {
          const selectedType = types.find(type => type.id === room.roomTypeId);
          setFormData(prevData => ({
            ...prevData,
            price: selectedType ? selectedType.price : 0
          }));
        }
  
        setRoomTypes(types);
        setRoomDetails(details);
      } catch (error) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAccessTokenSilently, room]);
  
  useEffect(() => {
    // Sincronizar los valores de room con formData cuando room cambie
    setFormData({
      id: room?.id || '',
      description: room?.description || '',
      roomTypeId: room?.roomTypeId || '',
      detailRoomId: room?.detailRoomId || '',
      photoRoom: room?.photoRoom || '',
      status: room?.status || 'available',
      price: room?.price || 0,
    });
  }, [room]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: name === 'price' ? Number(value) : value,
    }));
  };
  
  const handleRoomTypeChange = (e) => {
    const selectedTypeId = e.target.value;
    const selectedType = roomTypes.find(type => type.id === selectedTypeId);

    setFormData({
      ...formData,
      roomTypeId: selectedTypeId,
      price: selectedType ? selectedType.price : 0, // Actualiza el precio automáticamente
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = {
      id: formData.id,
      description: formData.description,
      roomTypeId: formData.roomTypeId,
      roomDetailId: formData.detailRoomId,
      price: Number(formData.price), // Asegúrate de que sea un número
      status: formData.status || 'available',
      photoRoom: formData.photoRoom || [],
    };

    console.log('Datos enviados:', formDataToSend); // Verifica el precio aquí

    try {
      const token = await getAccessTokenSilently();
      if (room.id) {
        const updatedRoom = await roomService.updateRoom(room.id, formDataToSend, token);
        console.log('Habitación actualizada:', updatedRoom);
        setSuccessMessage('Habitación actualizada con éxito');
      } else {
        const newRoom = await roomService.createRoom(formDataToSend, token);
        console.log('Habitación creada:', newRoom);
        setSuccessMessage('Habitación creada con éxito');
      }
      onSave(formDataToSend);
    } catch (error) {
      setError('Error en la operación: ' + error.response?.data || error.message);
    }
  };

  if (loading) {
    return <p>Cargando tipos y detalles de habitación...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border border-gray-300 rounded">
      <h1 className="text-lg font-bold mb-4">{room?.id ? 'Actualizar Habitación' : 'Crear Nueva Habitación'}</h1>
      {error && <p className="text-red-500">{error}</p>}
      {successMessage && <p className="text-green-500">{successMessage}</p>}
      <label className="block mb-2">
        Id:
        <input
          type="text"
          name="id"
          value={formData.id}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </label>
      <label className="block mb-2">
        Descripción:
        <input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        />
      </label>
      <label className="block mb-2">
        Tipo de Habitación:
        <select
          name="roomTypeId"
          value={formData.roomTypeId}
          onChange={handleRoomTypeChange}
          required
          className="border border-gray-300 p-2 w-full"
        >
          <option value="">Selecciona un tipo</option>
          {roomTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </label>
      <label className="block mb-2">
        Detalles:
        <select
          name="detailRoomId"
          value={formData.detailRoomId}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        >
          <option value="">Selecciona un detalle</option>
          {roomDetails.map((detail) => {
            const servicios = [];
            if (detail.cableTvService) servicios.push("TV por Cable");
            if (detail.smart_TV) servicios.push("Smart TV");
            if (detail.wifi) servicios.push("WiFi");
            if (detail.microwave) servicios.push("Microondas");
            if (detail.pava_electrica) servicios.push("Pava Eléctrica");

            const descripcion = servicios.length > 0 ? servicios.join(", ") : "Sin servicios";

            return (
              <option key={detail.id} value={detail.id}>
                {descripcion}
              </option>
            );
          })}
        </select>
      </label>
      <label className="block mb-2">
        Precio:
        <input
          type="number"
          name="price"
          value={formData.price} // El precio ahora proviene del estado
          readOnly // Deshabilita la edición manual
          className="border border-gray-300 p-2 w-full bg-gray-100 cursor-not-allowed"
        />
        {formData.roomTypeId && (
          <span className="text-sm text-gray-500">
            Precio sugerido: {formData.price}
          </span>
        )}
      </label>
      <label className="block mb-2">
        Foto:
        <input
          type="file"
          name="photoRoom"
          onChange={(e) => setFormData({ ...formData, photoRoom: e.target.files[0] })}
          className="border border-gray-300 p-2 w-full"
        />
      </label>
      <label className="block mb-2">
        Estado:
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="border border-gray-300 p-2 w-full"
        >
          <option value="available">Disponible</option>
          <option value="unavailable">Ocupado</option>
        </select>
      </label>
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        {room?.id ? 'Actualizar Habitación' : 'Crear Habitación'}
      </button>
    </form>
  );
};

export default RoomForm;
