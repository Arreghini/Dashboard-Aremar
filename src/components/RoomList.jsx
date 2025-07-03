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

      const roomsWithPhotoArray = roomsArray.map(room => ({
        ...room,
        photoRoom: room.photoRoom || []
      }));

      setRooms(roomsWithPhotoArray);
    } catch (error) {
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
      setError('Error al cargar los tipos de habitación');
    }
  };

  const fetchRoomDetails = async () => {
    try {
      const token = await getAccessTokenSilently();
      const details = await roomClasifyService.getRoomDetail(token);
      setRoomDetailsList(details || []);
    } catch (error) {
      // Error opcional manejar
    }
  };

  const handleDelete = async (roomId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta habitación?')) return;

    try {
      setError('');
      setSuccessMessage('');
      const token = await getAccessTokenSilently();
      await roomService.deleteRoom(roomId, token);
      setSuccessMessage('Habitación eliminada con éxito');
      await fetchRooms();
      if (onUpdate) onUpdate();
    } catch (error) {
      setError(`Error al eliminar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (room) => {
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
      if (newPhotos.length > 0) {
        newPhotos.forEach(file => formData.append('newPhotos', file));
      }
      await roomService.updateRoom(editingRoom.id, formData, token);
      setSuccessMessage('Habitación actualizada con éxito');
      setIsEditModalOpen(false);
      setEditingRoom(null);
      resetEditForm();
      await fetchRooms();
      if (onUpdate) onUpdate();
    } catch (error) {
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

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRoom(null);
    resetEditForm();
    setError('');
    setSuccessMessage('');
  };

  // Badges para estados con clases claras
  const getStatusBadge = (status) => {
    const statusConfig = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: '✅ Disponible' },
      occupied: { bg: 'bg-red-100', text: 'text-red-800', label: '🔴 Ocupada' },
      maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🔧 Mantenimiento' },
      cleaning: { bg: 'bg-blue-100', text: 'text-blue-800', label: '🧹 Limpieza' }
    };
    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`${config.bg} ${config.text} px-2 py-1 rounded-full text-xs font-medium`}>
        {config.label}
      </span>
    );
  };

  // Amenities con colores definidos en un objeto para Tailwind
  const amenityColors = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    purple: 'bg-purple-100 text-purple-800',
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mar-profundo mx-auto mb-2"></div>
          <p>Cargando habitaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4 text-mar-profundo dark:text-mar-espuma">Lista de Habitaciones</h3>

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
        <div className="text-center py-8 bg-neutral.claro dark:bg-neutral.oscuro rounded-lg">
          <p className="text-gray-500 text-lg">No hay habitaciones registradas</p>
          <p className="text-gray-400 text-sm mt-2">Crea la primera habitación usando el formulario de arriba</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roomsWithFullDetails.map(room => (
            <div key={room.id} className="border rounded-lg p-4 shadow-md bg-white dark:bg-neutral.oscuro hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-lg text-mar-profundo dark:text-mar-espuma">
                  {room.id || `Habitación ${room.id}`}
                </h4>
                {getStatusBadge(room.status)}
              </div>

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
                          onError={e => e.target.style.display = 'none'}
                          onClick={() => window.open(photo, '_blank')}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                          <span className="text-white text-xs opacity-0 group-hover:opacity-100 font-medium">👁️ Ver</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {room.photoRoom.length > 4 && (
                    <p className="text-xs text-gray-500 mt-1">+{room.photoRoom.length - 4} foto(s) más</p>
                  )}
                </div>
              ) : (
                <div className="mb-4 p-3 bg-gray-100 dark:bg-gray-600 rounded text-center">
                  <p className="text-sm text-gray-500">📷 Sin fotos</p>
                </div>
              )}

              <div className="mb-4 text-sm space-y-1 bg-gray-50 dark:bg-neutral.oscuro p-3 rounded">
                <p><strong>🏷️ Tipo:</strong> {room.roomType?.name || 'Sin tipo'}</p>
                <div>
                  <strong>📋 Detalles:</strong>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {getRoomAmenities(room.detailRoom).length > 0 ? (
                      getRoomAmenities(room.detailRoom).map((amenity, i) => (
                        <span key={i} className={`${amenityColors[amenity.color]} px-2 py-1 rounded text-xs font-medium`}>
                          {amenity.label}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 text-xs">Sin servicios especificados</span>
                    )}
                  </div>
                </div>
                <p className="text-center mt-2 font-semibold text-green-600 dark:text-green-400">
                  <strong>💰 Precio:</strong> ${room.price?.toLocaleString() || 'No definido'}
                </p>
              </div>

              {room.createdAt && (
                <div className="mb-4 text-xs text-gray-500 border-t pt-2">
                  <p>📅 Creado: {new Date(room.createdAt).toLocaleDateString('es-ES')}</p>
                  <p>🕒 Hora: {new Date(room.createdAt).toLocaleTimeString('es-ES')}</p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded shadow transition"
                  onClick={() => handleEdit(room)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded shadow transition"
                  onClick={() => handleDelete(room.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal para editar */}
      {isEditModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={closeEditModal}
        >
          <div
            className="bg-white dark:bg-neutral.oscuro rounded-lg shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 text-mar-profundo dark:text-mar-espuma">
              Editar habitación {editingRoom?.id}
            </h3>

            {error && (
              <div className="mb-4 text-red-700 bg-red-100 p-2 rounded">{error}</div>
            )}
            {successMessage && (
              <div className="mb-4 text-green-700 bg-green-100 p-2 rounded">{successMessage}</div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4">
              <div>
                <label className="block font-medium mb-1" htmlFor="description">Descripción</label>
                <input
                  type="text"
                  id="description"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mar-profundo"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1" htmlFor="roomType">Tipo de Habitación</label>
                <select
                  id="roomType"
                  value={editFormData.roomTypeId}
                  onChange={(e) => setEditFormData({ ...editFormData, roomTypeId: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mar-profundo"
                  required
                >
                  <option value="">Seleccione un tipo</option>
                  {roomTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1" htmlFor="detailRoom">Detalle de Habitación</label>
                <select
                  id="detailRoom"
                  value={editFormData.detailRoomId}
                  onChange={(e) => setEditFormData({ ...editFormData, detailRoomId: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mar-profundo"
                  required
                >
                  <option value="">Seleccione un detalle</option>
                  {roomDetailsList.map(detail => (
                    <option key={detail.id} value={detail.id}>
                      {detail.description || detailNames[detail.name] || detail.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1" htmlFor="price">Precio</label>
                <input
                  type="number"
                  id="price"
                  value={editFormData.price}
                  onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mar-profundo"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label className="block font-medium mb-1" htmlFor="status">Estado</label>
                <select
                  id="status"
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mar-profundo"
                >
                  <option value="available">Disponible</option>
                  <option value="occupied">Ocupada</option>
                  <option value="maintenance">Mantenimiento</option>
                  <option value="cleaning">Limpieza</option>
                </select>
              </div>

              {/* Aquí puedes agregar el manejo para fotos (existingPhotos y newPhotos) si quieres */}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-md"
                  onClick={closeEditModal}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md font-semibold text-white transition ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-mar-profundo hover:bg-mar-claro'
                  }`}
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomList;
