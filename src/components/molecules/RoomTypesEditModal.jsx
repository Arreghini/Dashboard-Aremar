import PropTypes from 'prop-types';

const RoomTypeEditModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  existingPhotos,
  setNewPhotos,
  removeExistingPhoto,
  error,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header del modal */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Editar Tipo de Habitación
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
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

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del tipo de habitación *
              </label>
              <input
                type="text"
                placeholder="Nombre"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'simpleBeds', label: '🛏️ Camas simples' },
                { key: 'trundleBeds', label: '🛏️ Camas cucheta' },
                { key: 'kingBeds', label: '👑 Camas matrimoniales' },
                { key: 'windows', label: '🪟 Ventanas' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.value })
                    }
                    className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                💰 Precio por noche
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
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
                onClick={onClose}
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
        </div>
      </div>
    </div>
  );
};

RoomTypeEditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  existingPhotos: PropTypes.array.isRequired,
  newPhotos: PropTypes.array.isRequired,
  setNewPhotos: PropTypes.func.isRequired,
  removeExistingPhoto: PropTypes.func.isRequired,
  error: PropTypes.string,
  isSubmitting: PropTypes.bool,
};

export default RoomTypeEditModal;
