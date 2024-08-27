import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

const DashboardPage = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          window.location.href = 'http://localhost:5173';
          return;
        }

        const response = await axios.get('http://localhost:3000/api/users/sync', {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        });

        setIsAdmin(response.data.isAdmin);
      } catch (error) {
        console.error('Error al verificar el estado de administrador:', error);
        window.location.href = 'http://localhost:5173';
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAdmin) {
    window.location.href = 'http://localhost:5173';
    return null;
  }
  return (
    <div>
      <h1>Dashboard</h1>
      <p>{authStatus}</p>
      <button onClick={handleRedirect}>Redirigir a 5173</button>

    <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
      <div className={`w-2/3 h-4/5 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-blue-200'} shadow-md p-6`}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`mb-4 px-4 py-2 rounded flex items-center ${darkMode ? 'text-white' : 'text-black'}`}
        >
          {darkMode ? <DarkModeIcon className="w-6 h-6 mr-2" /> : <LightModeIcon className="w-6 h-6 mr-2" />}
        </button>
        <h1 className="font-bold text-2xl mb-4 text-center uppercase">DASHBOARD DEL ADMINISTRADOR</h1>
        {userCredentials && (
          <div className="mb-4 text-center">
            <h2 className="font-bold text-lg">Bienvenido, {userCredentials.username}</h2>
            <p>Email: {userCredentials.email}</p>
            <p>Rol: {userCredentials.role}</p>
          </div>
        )}
        <button
            onClick={handleReturnToHome}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver a Inicio
          </button>
        <h1 className="font-bold text-2xl mb-4 text-center uppercase">DASHBOARD DEL ADMINISTRADOR</h1>

        {/* Sección de Usuarios */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase mt-10">USUARIOS</h2>
          <div className="flex flex-col items-start">
            <button className="mb-2" onClick={() => setSelectedUser({})}>Crear Usuario</button>
            <button onClick={() => setShowUsers(!showUsers)} className="mb-2">
              {showUsers ? 'Ocultar Lista de Usuarios' : 'Lista de Usuarios'}
            </button>
            {showUsers && (
              <div className="w-full">
                <UserList key={refresh} onEdit={setSelectedUser} onDelete={() => setRefresh(!refresh)} />
              </div>
            )}
          </div>
          {selectedUser && (
            <div className="mt-4">
              <UserForm user={selectedUser} onSave={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>

        {/* Sección de Habitaciones */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase">HABITACIONES</h2>
          <div className="flex flex-col items-start">
            <button className="mb-2" onClick={() => setSelectedRoom({})}>Crear Habitación</button>
            <button onClick={() => setShowRooms(!showRooms)} className="mb-2">
              {showRooms ? 'Ocultar Lista de Habitaciones' : 'Lista de Habitaciones'}
            </button>
            {showRooms && (
              <div className="w-full">
                <RoomList key={refresh} onEdit={setSelectedRoom} onDelete={() => setRefresh(!refresh)} />
              </div>
            )}
          </div>
          {selectedRoom && (
            <div className="mt-4">
              <RoomForm room={selectedRoom} onSave={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>

        {/* Sección de Reservas */}
        <div className="mb-8">
          <h2 className="font-bold text-lg mb-2 text-left uppercase">RESERVAS</h2>
          <div className="flex flex-col items-start">
            <button className="mb-2" onClick={() => setSelectedReservation({})}>Crear Reserva</button>
            <button onClick={() => setShowReservations(!showReservations)} className="mb-2">
              {showReservations ? 'Ocultar Lista de Reservas' : 'Lista de Reservas'}
            </button>
            {showReservations && (
              <div className="w-full">
                <ReservationList key={refresh} onEdit={setSelectedReservation} onDelete={() => setRefresh(!refresh)} />
              </div>
            )}
          </div>
          {selectedReservation && (
            <div className="mt-4">
              <ReservationForm reservation={selectedReservation} onSave={() => setRefresh(!refresh)} />
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
};

export default DashboardPage;



// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import LightModeIcon from '@mui/icons-material/LightMode';
// import DarkModeIcon from '@mui/icons-material/DarkMode';
// import UserList from '../components/UserList';
// import UserForm from '../components/UserForm';
// import RoomList from '../components/RoomList';
// import RoomForm from '../components/RoomForm';
// import ReservationList from '../components/ReservationList';
// import ReservationForm from '../components/ReservationForm';

// const DashboardPage = () => {
//   const [authStatus, setAuthStatus] = useState('');
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const checkAuthAndAdmin = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         console.log('Token obtenido:', token);

//         const response = await axios.get('http://localhost:3000/api/users/sync', {
//           headers: { Authorization: `Bearer ${token}` },
//           withCredentials: true
//         });
        
//         console.log('Respuesta del servidor:', response.data);

//         if (response.data.authenticated && response.data.isAdmin) {
//           setAuthStatus('Usuario autenticado y es admin');
//         } else {
//           setAuthStatus('Usuario no autenticado o no es admin');
//         }
//       } catch (error) {
//         console.error('Error al verificar la autenticación:', error);
//         setAuthStatus('Error en la autenticación');
//       } finally {
//         setLoading(false);
//       }
//     };

//     checkAuthAndAdmin();
//   }, []);

//   const handleRedirect = () => {
//     window.location.href = 'http://localhost:5173';
//   };

//   if (loading) {
//     return <div>Cargando...</div>;
//   }


//   return (
//     <div>
//       <h1>Dashboard</h1>
//       <p>{authStatus}</p>
//       <button onClick={handleRedirect}>Redirigir a 5173</button>

//     <div className={`flex justify-center items-center h-screen ${darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-black'}`}>
//       <div className={`w-2/3 h-4/5 rounded-lg ${darkMode ? 'bg-gray-900' : 'bg-blue-200'} shadow-md p-6`}>
//         <button
//           onClick={() => setDarkMode(!darkMode)}
//           className={`mb-4 px-4 py-2 rounded flex items-center ${darkMode ? 'text-white' : 'text-black'}`}
//         >
//           {darkMode ? <DarkModeIcon className="w-6 h-6 mr-2" /> : <LightModeIcon className="w-6 h-6 mr-2" />}
//         </button>
//         <h1 className="font-bold text-2xl mb-4 text-center uppercase">DASHBOARD DEL ADMINISTRADOR</h1>
//         {userCredentials && (
//           <div className="mb-4 text-center">
//             <h2 className="font-bold text-lg">Bienvenido, {userCredentials.username}</h2>
//             <p>Email: {userCredentials.email}</p>
//             <p>Rol: {userCredentials.role}</p>
//           </div>
//         )}
//         <button
//             onClick={handleReturnToHome}
//             className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
//           >
//             Volver a Inicio
//           </button>
//         <h1 className="font-bold text-2xl mb-4 text-center uppercase">DASHBOARD DEL ADMINISTRADOR</h1>

//         {/* Sección de Usuarios */}
//         <div className="mb-8">
//           <h2 className="font-bold text-lg mb-2 text-left uppercase mt-10">USUARIOS</h2>
//           <div className="flex flex-col items-start">
//             <button className="mb-2" onClick={() => setSelectedUser({})}>Crear Usuario</button>
//             <button onClick={() => setShowUsers(!showUsers)} className="mb-2">
//               {showUsers ? 'Ocultar Lista de Usuarios' : 'Lista de Usuarios'}
//             </button>
//             {showUsers && (
//               <div className="w-full">
//                 <UserList key={refresh} onEdit={setSelectedUser} onDelete={() => setRefresh(!refresh)} />
//               </div>
//             )}
//           </div>
//           {selectedUser && (
//             <div className="mt-4">
//               <UserForm user={selectedUser} onSave={() => setRefresh(!refresh)} />
//             </div>
//           )}
//         </div>

//         {/* Sección de Habitaciones */}
//         <div className="mb-8">
//           <h2 className="font-bold text-lg mb-2 text-left uppercase">HABITACIONES</h2>
//           <div className="flex flex-col items-start">
//             <button className="mb-2" onClick={() => setSelectedRoom({})}>Crear Habitación</button>
//             <button onClick={() => setShowRooms(!showRooms)} className="mb-2">
//               {showRooms ? 'Ocultar Lista de Habitaciones' : 'Lista de Habitaciones'}
//             </button>
//             {showRooms && (
//               <div className="w-full">
//                 <RoomList key={refresh} onEdit={setSelectedRoom} onDelete={() => setRefresh(!refresh)} />
//               </div>
//             )}
//           </div>
//           {selectedRoom && (
//             <div className="mt-4">
//               <RoomForm room={selectedRoom} onSave={() => setRefresh(!refresh)} />
//             </div>
//           )}
//         </div>

//         {/* Sección de Reservas */}
//         <div className="mb-8">
//           <h2 className="font-bold text-lg mb-2 text-left uppercase">RESERVAS</h2>
//           <div className="flex flex-col items-start">
//             <button className="mb-2" onClick={() => setSelectedReservation({})}>Crear Reserva</button>
//             <button onClick={() => setShowReservations(!showReservations)} className="mb-2">
//               {showReservations ? 'Ocultar Lista de Reservas' : 'Lista de Reservas'}
//             </button>
//             {showReservations && (
//               <div className="w-full">
//                 <ReservationList key={refresh} onEdit={setSelectedReservation} onDelete={() => setRefresh(!refresh)} />
//               </div>
//             )}
//           </div>
//           {selectedReservation && (
//             <div className="mt-4">
//               <ReservationForm reservation={selectedReservation} onSave={() => setRefresh(!refresh)} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//     </div>
//   );
// };

// export default DashboardPage;
