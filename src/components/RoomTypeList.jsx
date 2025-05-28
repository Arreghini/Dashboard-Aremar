import { useState, useEffect } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';
import Modal from './Modal';

const RoomTypeList = ({ refresh, onUpdate }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingRoomType, setEditingRoomType] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    simpleBeds: '',
    trundleBeds: '',
    kingBeds: '',
    windows: '',
    price: '',
  });
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [newPhotos, setNewPhotos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRoomTypes();
  }, [refresh]);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      setError('');
      const token = await getAccessTokenSilently();
      const responseData = await roomClasifyService.getRoomType(token);
      
      console.log('Respuesta del servicio:', responseData);
      
      let roomTypesArray = [];
      if (responseData) {
        if (responseData.success && Array.isArray(responseData.data)) {
          roomTypesArray = responseData.data;
        } else if (Array.isArray(responseData)) {
          roomTypesArray = responseData;
        } else if (Array.isArray(responseData.roomTypes)) {
          roomTypesArray = responseData.roomTypes;
        }
      }
      
      console.log('Tipos de habitación cargados:', roomTypesArray);
      setRoomTypes(roomTypesArray);
    } catch (error) {
      console.error('Error al obtener tipos de habitación:', error);
      setError('Error al cargar los tipos de habitación');
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (roomTypeId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este tipo de habitación?')) {
      return;
    }
    
    try {
      setError('');
      setSuccessMessage('');
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomType(roomTypeId, token);
      setSuccessMessage('Tipo de habitación eliminado con éxito');
      await fetchRoomTypes();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error al eliminar:', error);
      setError(`Error al eliminar: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleEdit = (roomType) => {
    setEditingRoomType(roomType);
    setEditFormData({
      name: roomType.name || '',
      simpleBeds: roomType.simpleBeds?.toString() || '',
      trundleBeds: roomType.trundleBeds?.toString() || '',
      kingBeds: roomType.kingBeds?.toString() || '',
      windows: roomType.windows?.toString() || '',
      price: roomType.price?.toString() || '',
    });
    setExistingPhotos(roomType.photos || []);
    setNewPhotos([]);
    setIsEditModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();
      
      // Crear FormData con todos los datos
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('simpleBeds', editFormData.simpleBeds || '0');
      formData.append('trundleBeds', editFormData.trundleBeds || '0');
      formData.append('kingBeds', editFormData.kingBeds || '0');
      formData.append('windows', editFormData.windows || '0');
      formData.append('price', editFormData.price || '0');
      
      // Agregar fotos existentes como JSON string
      if (existingPhotos.length > 0) {
        formData.append('existingPhotos', JSON.stringify(existingPhotos));
      }
      
      // Agregar archivos nuevos
      if (newPhotos && newPhotos.length > 0) {
        newPhotos.forEach(file => {
          formData.append('photos', file);
        });
      }
      
      await roomClasifyService.updateRoomTypeWithFiles(editingRoomType.id, formData, token);
      
      setSuccessMessage('Tipo de habitación actualizado con éxito');
      setIsEditModalOpen(false);
      setEditingRoomType(null);
      resetEditForm();
      await fetchRoomTypes();
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
      name: '',
      simpleBeds: '',
      trundleBeds: '',
      kingBeds: '',
      windows: '',
      price: '',
    });
    setExistingPhotos([]);
    setNewPhotos([]);
  };

  const removeExistingPhoto = (photoIndex) => {
    setExistingPhotos(prev => prev.filter((_, index) => index !== photoIndex));
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditingRoomType(null);
    resetEditForm();
    setError('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p>Cargando tipos de habitación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4">Lista de Tipos de Habitación</h3>
      
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
      
      {roomTypes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 text-lg">No hay tipos de habitación registrados</p>
          <p className="text-gray-400 text-sm mt-2">Crea el primer tipo de habitación usando el formulario de arriba</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {roomTypes.map((roomType) => (
            <div key={roomType.id} className="border rounded-lg p-4 shadow-md bg-white dark:bg-gray-700 hover:shadow-lg transition-shadow">
              <h4 className="font-semibold text-lg mb-3 text-blue-600 dark:text-blue-400">
                {roomType.name}
              </h4>
              
              {/* Sección de Fotos */}
              {roomType.photos && roomType.photos.length > 0 ? (
                <div className="mb-4">
                  <h5 className="font-medium text-sm mb-2 text-gray-700 dark:text-gray-300">
                    Fotos ({roomType.photos.length}):
                  </h5>
                  <div className="grid grid-cols-2 gap-2">
                    {roomType.photos.slice(0, 4).map((photo, index) => (
                      <div key={index} className="relative group">
                        <img 
                          src={photo} 
                          alt={`${roomType.name} - foto ${index + 1}`}
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
                  {roomType.photos.length > 4 && (
                    <p className="text-xs text-gray-500 mt-1">
                      +{roomType.photos.length - 4} foto(s) más
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
                <div className="grid grid-cols-2 gap-2">
                  <p><strong>🛏️ Simples:</strong> {roomType.simpleBeds || 0}</p>
                  <p><strong>🛏️ Cucheta:</strong> {roomType.trundleBeds || 0}</p>
                  <p><strong>👑 Matrimonial:</strong> {roomType.kingBeds || 0}</p>
                  <p><strong>🪟 Ventanas:</strong> {roomType.windows || 0}</p>
                </div>
                <p className="text-center mt-2 font-semibold text-green-600 dark:text-green-400">
                  <strong>💰 Precio:</strong> ${roomType.price?.toLocaleString() || 'No definido'}
                </p>
              </div>

              {/* Fechas */}
              <div className="mb-4 text-xs text-gray-500 border-t pt-2">
                                <p>📅 Creado: {new Date(roomType.createdAt).toLocaleDateString('es-ES')}</p>
                <p>🕒 Hora: {new Date(roomType.createdAt).toLocaleTimeString('es-ES')}</p>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end gap-2">
                <button
                  className="text-sm bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-3 rounded"
                  onClick={() => handleEdit(roomType)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="text-sm bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded"
                  onClick={() => handleDelete(roomType.id)}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de edición */}
      {isEditModalOpen && (
        <Modal onClose={closeEditModal} title="Editar Tipo de Habitación">
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del tipo de habitación *
              </label>
              <input
                type="text"
                placeholder="Nombre"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🛏️ Camas simples
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Camas simples"
                  value={editFormData.simpleBeds}
                  onChange={(e) => setEditFormData({ ...editFormData, simpleBeds: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🛏️ Camas cucheta
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Camas cucheta"
                  value={editFormData.trundleBeds}
                  onChange={(e) => setEditFormData({ ...editFormData, trundleBeds: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  👑 Camas matrimoniales
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Camas matrimoniales"
                  value={editFormData.kingBeds}
                  onChange={(e) => setEditFormData({ ...editFormData, kingBeds: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  🪟 Ventanas
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Ventanas"
                  value={editFormData.windows}
                  onChange={(e) => setEditFormData({ ...editFormData, windows: e.target.value })}
                  className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Precio por noche
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="Precio"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                📷 Agregar nuevas fotos
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setNewPhotos(Array.from(e.target.files))}
                className="w-full border border-gray-300 p-3 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {/* Fotos existentes */}
            {existingPhotos.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotos actuales (clic en ✕ para eliminar):
                </label>
                <div className="flex flex-wrap gap-2">
                  {existingPhotos.map((photo, index) => (
                    <div key={index} className="relative w-20 h-20">
                      <img
                        src={photo}
                        alt={`foto ${index}`}
                        className="w-full h-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingPhoto(index)}
                        className="absolute top-0 right-0 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default RoomTypeList;
