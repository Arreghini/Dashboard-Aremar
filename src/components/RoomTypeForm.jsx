import { useState } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';
import PropTypes from 'prop-types';

const RoomTypeForm = ({ onRoomTypeCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomTypeData, setRoomTypeData] = useState({
    name: '',
    simpleBeds: '',
    trundleBeds: '',
    kingBeds: '',
    windows: '',
    price: '',
  });
  const [newPhotos, setNewPhotos] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();

      // Crear FormData con todos los datos
      const formData = new FormData();
      formData.append('name', roomTypeData.name);
      formData.append('simpleBeds', roomTypeData.simpleBeds || '0');
      formData.append('trundleBeds', roomTypeData.trundleBeds || '0');
      formData.append('kingBeds', roomTypeData.kingBeds || '0');
      formData.append('windows', roomTypeData.windows || '0');
      formData.append('price', roomTypeData.price || '0');

      // Agregar archivos de fotos
      if (newPhotos && newPhotos.length > 0) {
        newPhotos.forEach((file) => {
          formData.append('photos', file);
        });
      }

      await roomClasifyService.createRoomTypeWithFiles(formData, token);

      setSuccessMessage('Tipo de habitación creado con éxito');
      resetForm();

      if (onRoomTypeCreated) {
        onRoomTypeCreated();
      }
    } catch (error) {
      console.error('Error al crear tipo de habitación:', error);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setRoomTypeData({
      name: '',
      simpleBeds: '',
      trundleBeds: '',
      kingBeds: '',
      windows: '',
      price: '',
    });
    setNewPhotos([]);
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="p-6 border border-gray-300 rounded-lg bg-white dark:bg-gray-800">
      <h2 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">
        Crear Nuevo Tipo de Habitación
      </h2>

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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre del tipo de habitación *
          </label>
          <input
            type="text"
            value={roomTypeData.name}
            onChange={(e) =>
              setRoomTypeData({ ...roomTypeData, name: e.target.value })
            }
            placeholder="Ej: Suite Deluxe, Habitación Estándar..."
            required
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🛏️ Camas simples
            </label>
            <input
              type="number"
              min="0"
              value={roomTypeData.simpleBeds}
              onChange={(e) =>
                setRoomTypeData({ ...roomTypeData, simpleBeds: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🛏️ Camas cucheta
            </label>
            <input
              type="number"
              min="0"
              value={roomTypeData.trundleBeds}
              onChange={(e) =>
                setRoomTypeData({
                  ...roomTypeData,
                  trundleBeds: e.target.value,
                })
              }
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              👑 Camas matrimoniales
            </label>
            <input
              type="number"
              min="0"
              value={roomTypeData.kingBeds}
              onChange={(e) =>
                setRoomTypeData({ ...roomTypeData, kingBeds: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              🪟 Ventanas
            </label>
            <input
              type="number"
              min="0"
              value={roomTypeData.windows}
              onChange={(e) =>
                setRoomTypeData({ ...roomTypeData, windows: e.target.value })
              }
              className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            💰 Precio por noche
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={roomTypeData.price}
            onChange={(e) =>
              setRoomTypeData({ ...roomTypeData, price: e.target.value })
            }
            placeholder="0.00"
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            📷 Fotos de la habitación
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setNewPhotos(Array.from(e.target.files))}
            className="w-full border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {newPhotos.length > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              {newPhotos.length} archivo(s) seleccionado(s)
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={resetForm}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Limpiar formulario
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !roomTypeData.name.trim()}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {isSubmitting ? 'Creando...' : 'Crear Tipo de Habitación'}
          </button>
        </div>
      </form>
    </div>
  );
};
RoomTypeForm.propTypes = {
  onRoomTypeCreated: PropTypes.func,
};

export default RoomTypeForm;
