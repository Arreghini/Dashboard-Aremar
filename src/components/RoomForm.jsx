import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import roomService from '../services/roomService';
import roomClasifyService from '../services/roomClasifyService';

const RoomForm = ({ onRoomCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomData, setRoomData] = useState({
    id: '',
    description: '',
    roomTypeId: '',
    price: '',
    status: 'available',
  });
  const [roomDetails, setRoomDetails] = useState({
    cableTvService: false,
    smart_TV: false,
    wifi: true,
    microwave: false,
    pava_electrica: false,
  });
  const [roomTypes, setRoomTypes] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingId, setIsCheckingId] = useState(false);
  const [idStatus, setIdStatus] = useState('');

  const detailNames = {
    cableTvService: "📺 TV por Cable",
    smart_TV: "📱 Smart TV", 
    wifi: "📶 WiFi",
    microwave: "🔥 Microondas",
    pava_electrica: "☕ Pava Eléctrica"
  };

  useEffect(() => {
    fetchRoomTypes();
  }, []);

  const checkIdAvailability = async (id) => {
    if (!id || !id.trim()) {
      setIdStatus('');
      return;
    }

    setIsCheckingId(true);
    try {
      const token = await getAccessTokenSilently();
      await roomService.getRoom(id.trim(), token);
      setIdStatus('exists');
    } catch (error) {
      if (error.response?.status === 404) {
        setIdStatus('available');
      } else {
        console.error('Error al verificar ID:', error);
        setIdStatus('error');
      }
    } finally {
      setIsCheckingId(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (roomData.id) {
        checkIdAvailability(roomData.id);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [roomData.id]);

  const fetchRoomTypes = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await roomClasifyService.getRoomTypes(token);
      setRoomTypes(response || []);
    } catch (error) {
      console.error('Error al obtener tipos de habitación:', error);
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
    }
  };

  const handleDetailChange = (e) => {
    const { name, checked } = e.target;
    setRoomDetails(prev => ({
      ...prev,
      [name]: checked
    }));
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

      if (idStatus === 'exists') {
        setError(`El ID "${roomData.id}" ya existe. Por favor, usa un ID diferente.`);
        setIsSubmitting(false);
        return;
      }

      try {
        await roomService.getRoom(roomData.id.trim(), token);
        setError(`El ID "${roomData.id}" ya existe. Por favor, usa un ID diferente.`);
        setIsSubmitting(false);
        return;
      } catch (checkError) {
        if (checkError.response?.status !== 404) {
          console.error('Error al verificar ID:', checkError);
          setError('Error al verificar la disponibilidad del ID');
          setIsSubmitting(false);
          return;
        }
      }
      
      console.log('=== DATOS ANTES DE CREAR FORMDATA ===');
      console.log('roomData completo:', roomData);
      console.log('roomDetails completo:', roomDetails);
      
      // 🔧 CREAR FORMDATA CON DETALLES INDIVIDUALES
      const formData = new FormData();
      formData.append('id', roomData.id.trim());
      formData.append('description', roomData.description);
      formData.append('roomTypeId', roomData.roomTypeId);
      formData.append('price', roomData.price || '0');
      formData.append('status', roomData.status);
      
      // 🔧 AGREGAR CADA DETALLE INDIVIDUALMENTE
      formData.append('cableTvService', roomDetails.cableTvService);
      formData.append('smart_TV', roomDetails.smart_TV);
      formData.append('wifi', roomDetails.wifi);
      formData.append('microwave', roomDetails.microwave);
      formData.append('pava_electrica', roomDetails.pava_electrica);
  
      // Agregar archivos de fotos
      if (newPhotos && newPhotos.length > 0) {
        newPhotos.forEach(file => {
          formData.append('photos', file);
        });
      }
      
      console.log('=== FormData antes de enviar ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      await roomService.createRoomWithDetails(formData, token);
  
      setSuccessMessage('Habitación creada con éxito');
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
    });
    setRoomDetails({
      cableTvService: false,
      smart_TV: false,
      wifi: true,
      microwave: false,
      pava_electrica: false,
    });
    setNewPhotos([]);
    setError('');
    setSuccessMessage('');
    setIdStatus('');
  };

  const getIdInputStyle = () => {
    const baseStyle = "w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm";
    
    if (isCheckingId) {
      return `${baseStyle} border-yellow-400 bg-yellow-50`;
    }
    
    switch (idStatus) {
      case 'available':
        return `${baseStyle} border-green-400 bg-green-50`;
      case 'exists':
        return `${baseStyle} border-red-400 bg-red-50`;
      case 'error':
        return `${baseStyle} border-orange-400 bg-orange-50`;
      default:
        return `${baseStyle} border-gray-300 dark:border-gray-600`;
    }
  };

  const getIdStatusMessage = () => {
    if (isCheckingId) {
      return <span className="text-yellow-600 text-xs">🔍 Verificando disponibilidad...</span>;
    }
    
    switch (idStatus) {
      case 'available':
        return <span className="text-green-600 text-xs">✅ ID disponible</span>;
      case 'exists':
        return <span className="text-red-600 text-xs">❌ Este ID ya existe</span>;
      case 'error':
        return <span className="text-orange-600 text-xs">⚠️ Error al verificar ID</span>;
      default:
        return null;
    }
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
              ID de la Habitación *
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
            <div className="mt-1">
              {getIdStatusMessage()}
            </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Servicios
            </h3>
            <div className="grid grid-cols-1 gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {Object.entries(detailNames).map(([key, label]) => (
                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name={key}
                    checked={roomDetails[key]}
                    onChange={handleDetailChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {label}
                  </span>
                </label>
              ))}
            </div>
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
