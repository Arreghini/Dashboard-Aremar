// src/pages/ReportsPage.jsx
import React from 'react';

const ReportsPage = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch('http://localhost:3000/export/excel');
      if (!response.ok) throw new Error('Error al descargar el archivo');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
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


