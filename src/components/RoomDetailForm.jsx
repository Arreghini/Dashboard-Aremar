import React, { useState, useEffect } from 'react';
import roomClasifyService from '../services/roomClasifyService';
import { useAuth0 } from '@auth0/auth0-react';

const RoomDetailForm = ({ onRoomDetailCreated }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [roomDetailData, setRoomDetailData] = useState({
    cableTvService: false,
    smart_TV: false,
    wifi: true, 
    microwave: false,
    pava_electrica: false,
  });  

  const [detailId, setDetailId] = useState(null);
  const [details, setDetails] = useState([]);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const detailNames = {
    cableTvService: "📺 TV por Cable",
    smart_TV: "📱 Smart TV",
    wifi: "📶 WiFi",
    microwave: "🔥 Microondas", 
    pava_electrica: "☕ Pava Eléctrica"
  };

  useEffect(() => {
    fetchDetails();
  }, [getAccessTokenSilently]);

  const fetchDetails = async () => {
    try {
      const token = await getAccessTokenSilently();
      const response = await roomClasifyService.getRoomDetail(token);
      console.log("Respuesta completa del servidor:", response);
      setDetails(response || []);
    } catch (error) {
      console.error('Error específico:', error.response);
      setError('Error al cargar los detalles de habitación');
    }
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setRoomDetailData(prevData => ({
      ...prevData,
      [name]: checked || false
    }));
  };

  // 🔧 VERIFICAR SI LA COMBINACIÓN YA EXISTE
  const checkIfCombinationExists = () => {
    return details.some(detail => 
      detail.cableTvService === roomDetailData.cableTvService &&
      detail.smart_TV === roomDetailData.smart_TV &&
      detail.wifi === roomDetailData.wifi &&
      detail.microwave === roomDetailData.microwave &&
      detail.pava_electrica === roomDetailData.pava_electrica &&
      detail.id !== detailId // Excluir el que estamos editando
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsSubmitting(true);

    try {
      const token = await getAccessTokenSilently();

      // 🔧 VERIFICAR DUPLICADOS SOLO AL CREAR (no al editar)
      if (!detailId && checkIfCombinationExists()) {
        setError('Esta combinación de servicios ya existe');
        setIsSubmitting(false);
        return;
      }
  
      if (detailId) {
        // ACTUALIZAR
        await roomClasifyService.updateRoomDetail(detailId, roomDetailData, token);
        setDetails(details.map(detail => 
          detail.id === detailId ? { ...detail, ...roomDetailData } : detail
        ));
        setSuccessMessage('✅ Combinación de servicios actualizada con éxito');
      } else {
        // CREAR NUEVO
        const response = await roomClasifyService.createRoomDetail(roomDetailData, token);
        const newDetail = response.data || response;
        setDetails([...details, newDetail]);
        setSuccessMessage('✅ Nueva combinación de servicios creada con éxito');
      }
  
      // Resetear formulario
      setRoomDetailData({
        cableTvService: false,
        smart_TV: false,
        wifi: true,  
        microwave: false,
        pava_electrica: false,
      });
      setDetailId(null);

      // Callback opcional
      if (onRoomDetailCreated) onRoomDetailCreated();
      
    } catch (error) {
      console.error("Error completo:", error);
      setError(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (id) => {
    const detail = details.find(detail => detail.id === id);
    if (detail) {
      setRoomDetailData({
        cableTvService: detail.cableTvService,
        smart_TV: detail.smart_TV,
        wifi: detail.wifi,
        microwave: detail.microwave,
        pava_electrica: detail.pava_electrica,
      });
    }
    setDetailId(id);
    setError('');
    setSuccessMessage('');
  };  

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta combinación de servicios?')) {
      return;
    }

    try {
      const token = await getAccessTokenSilently();
      await roomClasifyService.deleteRoomDetail(id, token);
      setDetails(details.filter(detail => detail.id !== id));
      setSuccessMessage('✅ Combinación de servicios eliminada con éxito');
      
      // Si estábamos editando este detalle, limpiar formulario
      if (detailId === id) {
        setRoomDetailData({
          cableTvService: false,
          smart_TV: false,
          wifi: true,
          microwave: false,
          pava_electrica: false,
        });
        setDetailId(null);
      }
    } catch (error) {
      setError(`Error al eliminar: ${error.response?.data?.message || error.message}`);
      console.error(error);
    }
  };

  const handleCancel = () => {
    setRoomDetailData({
      cableTvService: false,
      smart_TV: false,
      wifi: true,
      microwave: false,
      pava_electrica: false,
    });
    setDetailId(null);
    setError('');
    setSuccessMessage('');
  };

  // 🔧 CONTAR SERVICIOS ACTIVOS
  const getActiveServicesCount = (detail) => {
    return Object.entries(detail).filter(([key, value]) => 
      key !== 'id' && value === true
    ).length;
  };

  // 🔧 OBTENER SERVICIOS ACTIVOS COMO TEXTO
  const getActiveServicesText = (detail) => {
    const activeServices = Object.entries(detail)
      .filter(([key, value]) => key !== 'id' && value === true && detailNames[key])
      .map(([key]) => detailNames[key]);
    
    return activeServices.length > 0 ? activeServices.join(', ') : 'Sin servicios';
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

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              {detailId ? '✏️ Editar Combinación' : '➕ Nueva Combinación'}
            </h3>
            
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              {Object.keys(detailNames).map((name) => (
                <label key={name} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={name}
                    checked={roomDetailData[name]}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {detailNames[name]}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Guardando...' : (detailId ? '✏️ Actualizar' : '➕ Crear')}
              </button>
              
              {detailId && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
              📋 Vista Previa
            </h3>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Servicios seleccionados:
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(roomDetailData).map(([key, value]) => {
                  if (value === true && detailNames[key]) {
                    return (
                      <span key={key} className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                        {detailNames[key]}
                      </span>
                    );
                  }
                  return null;
                })}
                {Object.values(roomDetailData).every(value => !value) && (
                  <span className="text-gray-500 text-sm">Sin servicios seleccionados</span>
                )}
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
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        ID: {detail.id}
                      </span>
                      <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        {getActiveServicesCount(detail)} servicios
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(detail).map(([key, value]) => {
                        if (key !== 'id' && value === true && detailNames[key]) {
                          return (
                            <span key={`${detail.id}-${key}`} className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded text-xs">
                              {detailNames[key]}
                            </span>
                          );
                        }
                        return null;
                      })}
                      {getActiveServicesCount(detail) === 0 && (
                        <span className="text-gray-500 text-sm">Sin servicios</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button 
                      onClick={() => handleEdit(detail.id)} 
                      className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded hover:bg-blue-50"
                      title="Editar combinación"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(detail.id)} 
                      className="text-red-600 hover:text-red-800 text-sm px-2 py-1 rounded hover:bg-red-50"
                      title="Eliminar combinación"
                    >
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
}

export default RoomDetailForm;
