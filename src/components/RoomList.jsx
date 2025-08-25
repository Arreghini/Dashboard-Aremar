import { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import roomService from '../services/roomService';
import roomClasifyService from '../services/roomClasifyService';
import PropTypes from 'prop-types';

const amenityColors = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  purple: 'bg-purple-100 text-purple-800',
};

const getRoomAmenities = (detailRoom) => {
  if (!detailRoom) return [];
  const amenities = [];
  if (detailRoom.cableTvService)
    amenities.push({ label: '📺 TV Cable', color: 'blue' });
  if (detailRoom.smart_TV)
    amenities.push({ label: '📱 Smart TV', color: 'blue' });
  if (detailRoom.wifi) amenities.push({ label: '📶 WiFi', color: 'green' });
  if (detailRoom.microwave)
    amenities.push({ label: '🔥 Microondas', color: 'green' });
  if (detailRoom.refrigerator)
    amenities.push({ label: '❄️ Refrigerador', color: 'green' });
  if (detailRoom.airConditioner)
    amenities.push({ label: '❄️ Aire Acondicionado', color: 'purple' });
  if (detailRoom.heater)
    amenities.push({ label: '🔥 Calefacción', color: 'purple' });
  if (detailRoom.pool) amenities.push({ label: '🏊 Piscina', color: 'yellow' });
  if (detailRoom.gym) amenities.push({ label: '🏋️ Gimnasio', color: 'yellow' });
  return amenities;
};

const RoomList = ({ onUpdate }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loadedDetails, setLoadedDetails] = useState({});
  const [roomDetailsList, setRoomDetailsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingRoom, setEditingRoom] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(new Set());

  // --- Fetch rooms
  const fetchRooms = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const responseData = await roomService.getRooms(token);
      const roomsArray = Array.isArray(responseData)
        ? responseData
        : responseData?.data || [];
      setRooms(roomsArray.map(room => ({ ...room, photoRoom: room.photoRoom || [] })));
    } catch (err) {
      setError('Error al cargar las habitaciones');
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  // --- Fetch room types
  const fetchRoomTypes = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const types = await roomClasifyService.getRoomTypes(token);
      setRoomTypes(types || []);
    } catch {
      setRoomTypes([]);
    }
  }, [getAccessTokenSilently]);

  // --- Fetch all room details
  const fetchRoomDetails = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const details = await roomClasifyService.getAllRoomDetails(token);
      setRoomDetailsList(details || []);
    } catch {
      setRoomDetailsList([]);
    }
  }, [getAccessTokenSilently]);

  // --- Load individual detail
const loadRoomDetail = useCallback(
  async detailRoomId => {
    if (!detailRoomId || loadedDetails[detailRoomId]) return loadedDetails[detailRoomId] || null;

    setLoadingDetails(prev => new Set(prev).add(detailRoomId)); // 🔹 marcar que está cargando

    try {
      const token = await getAccessTokenSilently();
      const detail = await roomClasifyService.getRoomDetailById(detailRoomId, token);
      setLoadedDetails(prev => ({ ...prev, [detailRoomId]: detail }));
      return detail;
    } catch {
      setLoadedDetails(prev => ({ ...prev, [detailRoomId]: null }));
      return null;
    } finally {
      setLoadingDetails(prev => {
        const updated = new Set(prev);
        updated.delete(detailRoomId); // 🔹 quitar de cargando
        return updated;
      });
    }
  },
  [getAccessTokenSilently, loadedDetails]
);
  // --- Initial fetch
  useEffect(() => {
    fetchRooms();
    fetchRoomTypes();
    fetchRoomDetails();
  }, [fetchRooms, fetchRoomTypes, fetchRoomDetails]);

  // --- Load details for rooms (avoid loop infinito)
  useEffect(() => {
    const loadDetailsForRooms = async () => {
      const loadedIds = new Set(Object.keys(loadedDetails));
      for (const room of rooms) {
        if (room.detailRoomId && !loadedIds.has(room.detailRoomId)) {
          await loadRoomDetail(room.detailRoomId);
        }
      }
    };
    if (rooms.length > 0) loadDetailsForRooms();
  }, [rooms, loadRoomDetail, loadedDetails]);

  // --- Delete
  const handleDelete = async roomId => {
    if (!confirm('¿Seguro que quieres eliminar esta habitación?')) return;
    try {
      const token = await getAccessTokenSilently();
      await roomService.deleteRoom(roomId, token);
      setSuccessMessage('Habitación eliminada con éxito');
      await fetchRooms();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError(err.message);
    }
  };

  // --- Edit
  const handleEdit = room => {
    setEditingRoom(room);
    setEditFormData({
      description: room.description || '',
      capacity: room.capacity?.toString() || '',
      roomTypeId: room.roomTypeId || '',
      detailRoomId: room.detailRoomId || '',
      price: room.price?.toString() || '0',
      status: room.status || 'available',
    });
    setExistingPhotos(room.photoRoom || []);
    setNewPhotos([]);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRoom(null);
    setEditFormData({});
    setExistingPhotos([]);
    setNewPhotos([]);
    setError('');
    setSuccessMessage('');
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const token = await getAccessTokenSilently();
      const formData = new FormData();
      formData.append('description', editFormData.description);
      formData.append('capacity', editFormData.capacity);
      formData.append('roomTypeId', editFormData.roomTypeId);
      formData.append('detailRoomId', editFormData.detailRoomId);
      formData.append('price', editFormData.price);
      formData.append('status', editFormData.status);
      if (existingPhotos.length > 0) {
        formData.append('existingPhotos', JSON.stringify(existingPhotos));
      }
      if (newPhotos.length > 0) {
        newPhotos.forEach(file => formData.append('newPhotos', file));
      }

      await roomService.updateRoom(editingRoom.id, formData, token);
      setSuccessMessage('Habitación actualizada con éxito');
      closeEditModal();
      await fetchRooms();
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Error al actualizar la habitación');
    }
  };

  if (loading) return <p>Cargando habitaciones...</p>;

  return (
    <div>
      {error && <div className="mb-2 text-red-500">{error}</div>}
      {successMessage && <div className="mb-2 text-green-500">{successMessage}</div>}

      {rooms.length === 0 ? (
        <p>No hay habitaciones</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {rooms.map(room => {
            const detail = loadedDetails[room.detailRoomId] || null;
            const roomType = roomTypes.find(t => t.id === room.roomTypeId);

            return (
              <div
                key={room.id}
                className="border rounded-lg shadow-sm flex flex-col overflow-hidden"
              >
                {/* Imagen */}
                <div className="h-48 w-full bg-gray-200 flex items-center justify-center">
                  {room.photoRoom && room.photoRoom.length > 0 ? (
                    <img
                      src={room.photoRoom[0]}
                      alt={`Foto habitación ${room.id}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-gray-500">Sin foto</span>
                  )}
                </div>

                {/* Contenido */}
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="text-xl font-semibold mb-2">{room.id}</h4>
                  <p>Tipo: {roomType?.name || 'Sin tipo'}</p>

                  <div className="h-20 overflow-auto mt-1 mb-2 flex flex-wrap gap-2 items-center">
                    <span className="font-semibold">Servicios:</span>
                    {detail
                      ? getRoomAmenities(detail).length > 0
                        ? getRoomAmenities(detail).map((amenity, i) => (
                            <span
                              key={i}
                              className={`${amenityColors[amenity.color]} px-2 py-1 rounded text-xs font-medium flex items-center gap-1`}
                            >
                              {amenity.label}
                            </span>
                          ))
                        : <span className="text-gray-500 text-xs">Sin servicios especificados</span>
                      : <span className="text-orange-500 text-xs">{room.detailRoomId ? (loadingDetails.has(room.detailRoomId) ? '⏳ Cargando detalles...' : '⚠️ Detalles no disponibles') : '📋 Sin detalles asignados'}</span>
                    }
                  </div>

                  <p>💰 Precio: {room.price || 'No definido'}</p>
                  <p>{room.status === 'available' ? '✅ Disponible' : '❌ No disponible'}</p>

                  {/* Botones */}
                  <div className="flex gap-2 mt-auto">
                    <button
                      onClick={() => handleEdit(room)}
                      className="flex-1 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="flex-1 bg-red-500 text-white p-2 rounded hover:bg-red-600 transition"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isEditModalOpen && editingRoom && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3>Editar habitación {editingRoom.id}</h3>
            <form onSubmit={handleUpdateSubmit}>
              <label htmlFor="description">Descripción</label>
              <input
                id="description"
                type="text"
                value={editFormData.description}
                onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                className="w-full border p-1 mb-2"
              />

              <label htmlFor="price">Precio</label>
              <input
                id="price"
                type="number"
                value={editFormData.price}
                onChange={e => setEditFormData({ ...editFormData, price: e.target.value })}
                className="w-full border p-1 mb-2"
              />

              {/* Amenities (detalles de habitación) */}
              <label htmlFor="detailRoomId">Detalles / Amenities</label>
              <select
                id="detailRoomId"
                value={editFormData.detailRoomId}
                onChange={e => setEditFormData({ ...editFormData, detailRoomId: e.target.value })}
                className="w-full border p-1 mb-2"
                required
              >
                <option value="">Seleccione un detalle</option>
                {roomDetailsList.map(detail => (
                  <option key={detail.id} value={detail.id}>
                    {detail.description || detail.name || `Detalle ${detail.id}`}
                  </option>
                ))}
              </select>

              {/* Fotos existentes */}
              <div className="mb-2">
                <label>Fotos actuales:</label>
                <div className="flex gap-2 flex-wrap">
                  {existingPhotos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`Foto ${idx + 1}`}
                      className="w-16 h-16 object-cover rounded border"
                    />
                  ))}
                </div>
              </div>

              {/* Agregar nuevas fotos */}
              <label htmlFor="newPhotos">Agregar nuevas fotos</label>
              <input
                type="file"
                id="newPhotos"
                multiple
                accept="image/*"
                onChange={e => setNewPhotos(Array.from(e.target.files))}
                className="w-full border p-1 mb-2"
              />
              {newPhotos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {newPhotos.map((file, idx) => (
                    <span key={idx} className="text-xs bg-gray-200 px-2 py-1 rounded">
                      {file.name}
                    </span>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={closeEditModal}
                className="mt-2 bg-gray-200 p-2 rounded"
              >
                Cerrar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

RoomList.propTypes = { onUpdate: PropTypes.func };

export default RoomList;
