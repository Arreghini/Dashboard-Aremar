import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const ReportsPage = ({ darkMode }) => {
  const { getAccessTokenSilently } = useAuth0();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const containerStyle = darkMode
    ? 'bg-neutral-oscuro text-neutral-claro'
    : 'bg-neutral-claro text-neutral-oscuro';

  const inputStyle = darkMode
    ? 'bg-neutral-claro text-neutral-oscuro border border-neutral-claro'
    : 'bg-white text-black border border-gray-300';

  const buttonBase = `mb-2 w-60 px-4 py-2 rounded font-body text-base transition-colors`;
  const buttonColor = darkMode
    ? 'bg-mar-espuma text-neutral-oscuro hover:text-neutral-claro'
    : 'bg-mar-claro text-neutral-claro hover:text-neutral-oscuro';

  const handleDownload = async () => {
    try {
      const token = await getAccessTokenSilently();

      let url = 'http://localhost:3000/api/admin/export/excel/analytics';
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
    <div className={`p-4 min-h-screen transition-colors duration-300 ${containerStyle}`}>
      <h1 className="text-xl font-bold mb-4">Reportes y Análisis</h1>

      <div className="mb-4">
        <div className="flex gap-4 mb-2">
          <div>
            <label htmlFor ="startDate" className="block text-sm font-medium mb-1">
              Fecha inicio:
            </label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`px-2 py-1 rounded ${inputStyle}`}
            />
          </div>
          <div>
            <label htmlFor='endDate' className="block text-sm font-medium mb-1">Fecha fin:</label>
            <input
              type="date"
              id="endDate"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`px-2 py-1 rounded ${inputStyle}`}
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleDownload}
        className={`${buttonBase} ${buttonColor}`}
      >
        Descargar Reporte Excel
      </button>
    </div>
  );
};

export default ReportsPage;
