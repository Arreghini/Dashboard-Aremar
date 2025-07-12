import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ReportsPage = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleDownload = async () => {
    try {
      const token = await getAccessTokenSilently();

      // Construir la URL con los parámetros de fecha
      let url = 'http://localhost:3000/api/admin/export/excel/analytics';

      // Agregar parámetros de fecha si están definidos
      if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Error al descargar el archivo');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = 'analytics.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Fallo en la descarga:', error);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Reportes y Análisis</h1>

      {/* Agregar campos para seleccionar fechas */}
      <div className="mb-4">
        <div className="flex gap-4 mb-2">
          <div>
            <label className="block text-sm font-medium mb-1">
              Fecha inicio:
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha fin:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border px-2 py-1 rounded"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Descargar Reporte Excel
      </button>
    </div>
  );
};

export default ReportsPage;
