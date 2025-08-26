import { useState, useEffect, useCallback } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';
import PropTypes from 'prop-types';

const RoomDetailForm = ({ onRoomDetailCreated }) => {
  const { getAccessTokenSilently } = useAuth0();

  // Lista de servicios con sus íconos
  const servicesList = [
    { key: 'cableTvService', label: '📺 TV por Cable', default: false },
    { key: 'smart_TV', label: '📱 Smart TV', default: false },
    { key: 'wifi', label: '📶 WiFi', default: false },
    { key: 'microwave', label: '🔥 Microondas', default: false },
    { key: 'pava_electrica', label: '☕ Pava Eléctrica', default: false },
  ];

  const initialRoomDetailData = servicesList.reduce(
    (acc, service) => ({ ...acc, [service.key]: service.default }),
    {}
  );

  const [roomDetailData, setRoomDetailData] = useState(initialRoomDetailData);
  const [detailId, setDetailId] = useState(null);
  const [details, setDetails] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await roomClasifyService.getAllRoomDetails(token);
      setDetails(response || []);
    } catch (error) {
      console.error('Error específico:', error.response);
      setError('Error al cargar los detalles de habitación');
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setRoomDetailData((prevData) => ({
      ...prevData,
      [name]: checked || false,
    }));
  };

  const checkIfCombinationExists = () => {
    return details.some(
      (detail) =>
        servicesList.every(
          (service) => detail[service.key] === roomDetailData[service.key]
        ) && detail.id !== detailId
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();

      if (!detailId && checkIfCombinationExists()) {
        setError('Esta combinación de servicios ya existe');
        setIsSubmitting(false);
        return;
      }

      if (detailId) {
        // ACTUALIZAR
        await roomClasifyService.updateRoomDetail(detailId, roomDetailData, token);
        setDetails(details.map((d) => (d.id === detailId ? { ...d, ...roomDetailData } : d)));
        setSuccessMessage('✅ Combinación de servicios actualizada con éxito');
      } else {
        // CREAR NUEVO
        const response = await roomClasifyService.createRoomDetail(roomDetailData, token);
        const newDetail = response.data || response;
        setDetails([...details, newDetail]);
        setSuccessMessage('✅ Nueva combinación de servicios creada con éxito');
      }

      setRoomDetailData(initialRoomDetailData);
      setDetailId(null);

      if (onRoomDetailCreated) onRoomDetailCreated();
    } catch (error) {
      console.error('Error completo:', error);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const detail = details.find((d) => d.id === id);
    if (detail) {
      const newData = servicesList.reduce(
        (acc, service) => ({ ...acc, [service.key]: detail[service.key] }),
        {}
      );
      setRoomDetailData(newData);
    }
    setDetailId(id);
    setError('');
    setSuccessMessage('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta combinación de servicios?')) return;

    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomDetail(id, token);
      setDetails(details.filter((d) => d.id !== id));
      setSuccessMessage('✅ Combinación de servicios eliminada con éxito');

      if (detailId === id) setRoomDetailData(initialRoomDetailData);
      setDetailId(null);
    } catch (error) {
      setError(`Error al eliminar: ${error.response?.data?.message || error.message}`);
      console.error(error);
    }
  };

  const handleCancel = () => {
    setRoomDetailData(initialRoomDetailData);
    setDetailId(null);
    setError('');
    setSuccessMessage('');
  };

  const getActiveServicesCount = (detail) => {
    return servicesList.filter((s) => detail[s.key]).length;
  };

  return (
    <div className="p-6 border border-gray-300 rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">
          🛠️ Administrador de Combinaciones de Servicios
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Gestiona las diferentes combinaciones de servicios que pueden tener las habitaciones
        </p>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{successMessage}</div>}

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {detailId ? '✏️ Editar Combinación' : '➕ Nueva Combinación'}
            </h3>
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {servicesList.map((service) => (
                <label key={service.key} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={service.key}
                    checked={roomDetailData[service.key]}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{service.label}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={isSubmitting || !Object.values(roomDetailData).some((v) => v === true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Guardando...' : detailId ? '✏️ Actualizar' : '➕ Crear'}
              </button>
              {detailId && (
                <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors">
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">📋 Vista Previa</h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Servicios seleccionados:</p>
              <div className="flex flex-wrap gap-2">
                {servicesList.map((service) =>
                  roomDetailData[service.key] ? (
                    <span key={service.key} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                      {service.label}
                    </span>
                  ) : null
                )}
                {Object.values(roomDetailData).every((v) => !v) && <span className="text-gray-500 text-sm">Sin servicios seleccionados</span>}
              </div>
            </div>
          </div>
        </div>
      </form>

      <div>
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
          📋 Combinaciones Existentes ({details.length})
        </h2>
        {details.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No hay combinaciones de servicios creadas</p>
            <p className="text-sm">Crea la primera combinación usando el formulario de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {details.map((detail) => (
              <div key={detail.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-white dark:bg-gray-800">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">ID: {detail.id}</span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">{getActiveServicesCount(detail)} servicios</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {servicesList.map((service) =>
                        detail[service.key] ? (
                          <span key={`${detail.id}-${service.key}`} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                            {service.label}
                          </span>
                        ) : null
                      )}
                      {getActiveServicesCount(detail) === 0 && <span className="text-gray-500 text-sm">Sin servicios</span>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => handleEdit(detail.id)} className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50" title="Editar combinación">
                      ✏️
                    </button>
                    <button onClick={() => handleDelete(detail.id)} className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50" title="Eliminar combinación">
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

RoomDetailForm.propTypes = {
  onRoomDetailCreated: PropTypes.func,
};

export default RoomDetailForm;
