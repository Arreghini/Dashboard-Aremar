import { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import roomService from '../services/roomService';
import roomClasifyService from '../services/roomClasifyService';

const RoomList = ({ refresh, onUpdate }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    description: '',
    roomTypeId: '',
    detailRoomId: '',
    price: '',
    status: 'available',
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roomDetailsList, setRoomDetailsList] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const detailNames = {
    cableTvService: 'TV Cable',
    smart_TV: 'Smart TV',
    wifi: 'WiFi',
    microwave: 'Microondas',
    pava_electrica: 'Pava Eléctrica',
  };

  useEffect(() => {
    fetchRooms();
    fetchRoomDetails();
    fetchRoomTypes();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await getAccessTokenSilently();
      const responseData = await roomService.getRooms(token);
      
      console.log('Respuesta del servicio de habitaciones:', responseData);
      
      let roomsArray = [];
      if (responseData) {
        if (responseData.success && Array.isArray(responseData.data)) {
          roomsArray = responseData.data;
        } else if (Array.isArray(responseData)) {
          roomsArray = responseData;
        } else if (Array.isArray(responseData.rooms)) {
          roomsArray = responseData.rooms;
        }
      }
      
      // Mapeo las fotos de cada habitación para que sean un array
      const roomsWithPhotoArray = roomsArray.map(room => ({
        ...room,
        photoRoom: room.photoRoom || []
      }));
      
      console.log('Habitaciones cargadas:', roomsWithPhotoArray);
      setRooms(roomsWithPhotoArray);
    } catch (error) {
      console.error('Error al obtener habitaciones:', error);
      setError('Error al cargar las habitaciones');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };
   const fetchRoomTypes = async () => {
  
    try {
      const token = await getAccessTokenSilently();
      const types = await roomClasifyService.getRoomTypes(token);
      setRoomTypes(types || []);
    } catch (error) {
      console.error('Error al obtener tipos de habitación:', error);
      setError('Error al cargar los tipos de habitación');
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

  const handleDelete = async (roomId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta habitación?')) {
      return;
    }
    
    try {
      setError('');
      setSuccessMessage('');
      const token = await getAccessTokenSilently();
      await roomService.deleteRoom(roomId, token);
      setSuccessMessage('Habitación eliminada con éxito');
      await fetchRooms();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError(`Error al eliminar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (room) => {
    console.log('Editando habitación:', room);
    console.log('Abriendo modal de edición...');
    
    setEditingRoom(room);
    setEditFormData({
      description: room.description || '',
      roomTypeId: room.roomTypeId?.toString() || '',
      detailRoomId: room.detailRoomId?.toString() || '',
      price: room.price?.toString() || '0',
      status: room.status || 'available',
    });
    setExistingPhotos(room.photoRoom || []);
    setNewPhotos([]);
    setIsEditModalOpen(true);
    setError('');
    setSuccessMessage('');
    
    console.log('Estado del modal:', true);
    console.log('Datos del formulario:', {
      description: room.description || '',
      roomTypeId: room.roomTypeId?.toString() || '',
      detailRoomId: room.detailRoomId?.toString() || '',
      price: room.price?.toString() || '0',
      status: room.status || 'available',
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();
      
      const formData = new FormData();
      formData.append('description', editFormData.description);
      formData.append('roomTypeId', editFormData.roomTypeId);
      formData.append('detailRoomId', editFormData.detailRoomId);
      formData.append('price', editFormData.price || '0');
      formData.append('status', editFormData.status);
      
      if (existingPhotos.length > 0) {
        formData.append('existingPhotos', JSON.stringify(existingPhotos));
      }
      
      if (newPhotos && newPhotos.length > 0) {
        newPhotos.forEach(file => {
          formData.append('newPhotos', file);
        });
      }
      
      await roomService.updateRoom(editingRoom.id, formData, token);
      
      setSuccessMessage('Habitación actualizada con éxito');
      setIsEditModalOpen(false);
      setEditingRoom(null);
      resetEditForm();
      await fetchRooms();
      if (onUpdate) onUpdate();
      
    } catch (error) {
      console.error('Error al actualizar:', error);
      setError(`Error al actualizar: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetEditForm = () => {
    setEditFormData({
      description: '',
      roomTypeId: '',
      detailRoomId: '',
      price: '',
      status: 'available',
    });
    setExistingPhotos([]);
    setNewPhotos([]);
  };

  const removeExistingPhoto = (photoIndex) => {
    setExistingPhotos(prev => prev.filter((_, index) => index !== photoIndex));
  };

  const closeEditModal = () => {
    console.log('Cerrando modal...');
    setIsEditModalOpen(false);
    setEditingRoom(null);
    resetEditForm();
    setError('');
    setSuccessMessage('');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Disponible' },
      occupied: { bg: 'bg-red-100', text: 'text-red-800', label: '🔴 Ocupada' },
      maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🔧 Mantenimiento' },
      cleaning: { bg: 'bg-blue-100', text: 'text-blue-800', label: '🧹 Limpieza' }
    };
    
    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getRoomAmenities = (detailRoom) => {
    if (!detailRoom) return [];
    
    const amenities = [];
    if (detailRoom.cableTvService) amenities.push({ label: '📺 TV Cable', color: 'blue' });
    if (detailRoom.smart_TV) amenities.push({ label: '📱 Smart TV', color: 'blue' });
    if (detailRoom.wifi) amenities.push({ label: '📶 WiFi', color: 'green' });
    if (detailRoom.microwave) amenities.push({ label: '🔥 Microondas', color: 'yellow' });
    if (detailRoom.pava_electrica) amenities.push({ label: '☕ Pava Eléctrica', color: 'purple' });
    
    return amenities;
  };

  const roomsWithDetails = rooms.map(room => ({
    ...room,
    detailRoom: roomDetailsList.find(d => d.id === room.detailRoomId) || null
  }));

  const roomsWithFullDetails = roomsWithDetails.map(room => ({
    ...room,
    roomType: roomTypes.find(type => type.id === room.roomTypeId) || null
  }));

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4">Lista de Habitaciones</h3>
      
      {/* Debug info */}
      {isEditModalOpen && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          <p>🔧 DEBUG: Modal debería estar abierto. Estado: {isEditModalOpen.toString()}</p>
          <p>Editando: {editingRoom?.description || 'Sin datos'}</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {rooms.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 text-lg">No hay habitaciones registradas</p>
          <p className="text-gray-400 text-sm mt-2">Crea la primera habitación usando el formulario de arriba</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roomsWithFullDetails.map((room) => (
            <div key={room.id} className="border rounded-lg p-4 shadow-md bg-white dark:bg-gray-700 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-lg text-blue-600 dark:text-blue-400">
                  {room.id || `Habitación ${room.id}`}
                </h4>
                {getStatusBadge(room.status)}
              </div>
              
              {/* Sección de Fotos */}
              {room.photoRoom && room.photoRoom.length > 0 ? (
                <div className="mb-4">
                  <h5 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Fotos ({room.photoRoom.length}):
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {room.photoRoom.slice(0, 4).map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`${room.description} - foto ${index + 1}`}
                          className="w-full h-20 object-cover rounded border hover:opacity-80 transition-opacity cursor-pointer"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            console.error('Error cargando imagen:', photo);
                          }}
                          onClick={() => window.open(photo, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">
                            👁️ Ver
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {room.photoRoom.length > 4 && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{room.photoRoom.length - 4} foto(s) más
                    </p>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-600 rounded text-center">
                  <p className="text-sm text-gray-500">📷 Sin fotos</p>
                </div>
              )}

              {/* Detalles de la habitación */}
              <div className="mb-4 text-sm space-y-1 bg-gray-50 dark:bg-gray-600 p-3 rounded">
                <div className="grid grid-cols-1 gap-2">
                  <p>
                    <strong>🏷️ Tipo:{room.roomType?.name || 'Sin tipo'} </strong>
                  </p>
                  <div>
                    <strong>📋 Detalles:</strong>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {getRoomAmenities(room.detailRoom).length > 0 ? (
                        getRoomAmenities(room.detailRoom).map((amenity, index) => (
                          <span 
                            key={index}
                            className={`bg-${amenity.color}-100 text-${amenity.color}-800 px-2 py-1 rounded text-xs`}
                          >
                            {amenity.label}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-500 text-xs">Sin servicios especificados</span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-center mt-2 font-semibold text-green-600 dark:text-green-400">
                  <strong>💰 Precio:</strong> ${room.price?.toLocaleString() || 'No definido'}
                </p>
              </div>

              {/* Fechas */}
              {room.createdAt && (
                <div className="mb-4 text-xs text-gray-500 border-t pt-2">
                  <p>📅 Creado: {new Date(room.createdAt).toLocaleDateString('es-ES')}</p>
                  <p>🕒 Hora: {new Date(room.createdAt).toLocaleTimeString('es-ES')}</p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex justify-end gap-2">
                <button
                  className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                  onClick={() => handleEdit(room)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                  onClick={() => handleDelete(room.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición - VERSIÓN INTEGRADA SIN COMPONENTE EXTERNO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del modal */}
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                Editar Habitación
              </h2>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  {successMessage}
                </div>
              )}
              <form onSubmit={handleUpdateSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Descripción
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Tipo de Habitación
                    </label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editFormData.roomTypeId}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, roomTypeId: e.target.value }))}
                      required
                    >
                      <option value="">Seleccionar</option>
                      {roomTypes.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Detalle de Habitación
                    </label>
                    <select
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editFormData.detailRoomId}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, detailRoomId: e.target.value }))}
                      required
                    >
                      <option value="">Selecciona una combinación</option>
                      {roomDetailsList.map(detail => (
                        <option key={detail.id} value={detail.id}>
                          {Object.entries(detailNames)
                            .filter(([key]) => detail[key])
                            .map(([key, label]) => label)
                            .join(', ') || 'Sin servicios'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Precio
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editFormData.price}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, price: e.target.value }))}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Estado
                    </label>
                    <input
                      type="text"
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editFormData.status}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value }))}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Fotos nuevas
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={e => setNewPhotos(Array.from(e.target.files))}
                      className="w-full border border-gray-300 rounded px-2 py-1"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 bg-blue-500 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-600 active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-25"
                    disabled={isSubmitting}
                  >
                    Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
