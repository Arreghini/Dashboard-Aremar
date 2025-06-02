import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import roomService from '../services/roomService';
import roomClasifyService from '../services/roomClasifyService';

const detailNames = {
  cableTvService: 'Cable TV',
  smart_TV: 'Smart TV',
  wifi: 'WiFi',
  microwave: 'Microondas',
  pava_electrica: 'Pava eléctrica',
};

const RoomForm = ({ onRoomCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomData, setRoomData] = useState({
    id: '',
    description: '',
    roomTypeId: '',
    price: '',
    status: 'available',
    detailRoomId: '', // Aquí se guarda la combinación elegida
  });

  const [roomTypes, setRoomTypes] = useState([]);
  const [roomDetailsList, setRoomDetailsList] = useState([]); // Combinaciones existentes
  const [newPhotos, setNewPhotos] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idStatus, setIdStatus] = useState('');

  useEffect(() => {
    fetchRoomTypes();
    fetchRoomDetails();
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await roomClasifyService.getRoomTypes(token);
      setRoomTypes(response || []);
    } catch (error) {
      console.error('Error al obtener tipos de habitación:', error);
    }
  };

  const fetchRoomDetails = async () => {
    try {
      const token = await getAccessTokenSilently();
      const details = await roomClasifyService.getRoomDetail(token);
      setRoomDetailsList(details || []);
    } catch (error) {
      console.error('Error al obtener combinaciones de detalles:', error);
    }
  };

  const handleRoomDataChange = (e) => {
    const { name, value } = e.target;
    setRoomData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'id') {
      setIdStatus('');
      setError('');
      setSuccessMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();

      if (!roomData.id || !roomData.id.trim()) {
        setError('El ID de la habitación es obligatorio');
        setIsSubmitting(false);
        return;
      }

      // Verificar disponibilidad del ID
      const result = await roomService.checkRoomIdAvailability(roomData.id.trim(), token);
      if (!result.available) {
        setError(`El ID "${roomData.id}" ya existe. Por favor, usa un ID diferente.`);
        setIsSubmitting(false);
        return;
      }

      if (!roomData.detailRoomId) {
        setError('Debes seleccionar una combinación de servicios.');
        setIsSubmitting(false);
        return;
      }

      // Crear el FormData para enviar al backend
      const formData = new FormData();
      formData.append('id', roomData.id.trim());
      formData.append('description', roomData.description);
      formData.append('roomTypeId', roomData.roomTypeId);
      formData.append('price', roomData.price || '0');
      formData.append('status', roomData.status);
      formData.append('detailRoomId', roomData.detailRoomId);

      // Agregar fotos
      if (newPhotos && newPhotos.length > 0) {
        newPhotos.forEach(file => {
          formData.append('photoRoom', file);
        });
      }

      await roomService.createRoomWithFormData(formData, token);

      setSuccessMessage('✅ Habitación creada con éxito con servicios vinculados');
      resetForm();

      if (onRoomCreated) {
        onRoomCreated();
      }

    } catch (error) {
      console.error('Error al crear habitación:', error);
      if (error.response?.data?.message?.includes('already exists')) {
        setError(`El ID "${roomData.id}" ya existe. Por favor, usa un ID diferente.`);
      } else {
        setError(`Error: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRoomData({
      id: '',
      description: '',
      roomTypeId: '',
      price: '',
      status: 'available',
      detailRoomId: '',
    });
    setNewPhotos([]);
    setError('');
    setSuccessMessage('');
    setIdStatus('');
  };

  const getIdInputStyle = () => {
    const baseStyle = "w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm";
    return `${baseStyle} border-gray-300 dark:border-gray-600`;
  };

  // Utilidad para mostrar los servicios de una combinación
  const renderDetailSummary = (detail) => {
    return Object.entries(detailNames)
      .filter(([key]) => detail[key])
      .map(([key, label]) => label)
      .join(', ') || 'Sin servicios';
  };

  return (
    <div className="p-4 border border-gray-300 rounded-2xl bg-white dark:bg-gray-800 w-full max-w-9xl mx-auto shadow-xl max-h-[90vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
        Crear Nueva Habitación
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-3 py-2 rounded mb-3 text-sm">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🏷️ ID de la Habitación * (Ej: HAB-001, SUITE-VIP, A1)
            </label>
            <input
              type="text"
              name="id"
              value={roomData.id}
              onChange={handleRoomDataChange}
              placeholder="Ej: HAB-001, A1, SUITE-VIP"
              required
              className={getIdInputStyle()}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción *
            </label>
            <input
              type="text"
              name="description"
              value={roomData.description}
              onChange={handleRoomDataChange}
              placeholder="Ej: Habitación con vista al mar"
              required
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo *
            </label>
            <select
              name="roomTypeId"
              value={roomData.roomTypeId}
              onChange={handleRoomDataChange}
              required
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="">Seleccionar</option>
              {roomTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              💰 Precio/noche
            </label>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={roomData.price}
              onChange={handleRoomDataChange}
              placeholder="0.00"
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Estado
            </label>
            <select
              name="status"
              value={roomData.status}
              onChange={handleRoomDataChange}
              className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="available">✅ Disponible</option>
              <option value="occupied">🔴 Ocupada</option>
              <option value="maintenance">🔧 Mantenimiento</option>
              <option value="cleaning">🧹 Limpieza</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            🛠️ Combinación de Servicios
          </label>
          <select
            name="detailRoomId"
            value={roomData.detailRoomId}
            onChange={handleRoomDataChange}
            required
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="">Selecciona una combinación</option>
            {roomDetailsList.map(detail => (
              <option key={detail.id} value={detail.id}>
                {renderDetailSummary(detail)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            📷 Fotos de la habitación
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewPhotos(Array.from(e.target.files))}
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 text-sm"
          />
          {newPhotos.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {newPhotos.length} archivo(s) seleccionado(s)
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            Limpiar
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !roomData.description.trim() || !roomData.roomTypeId || !roomData.id.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
          >
            {isSubmitting ? 'Creando...' : 'Crear Habitación'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RoomForm;