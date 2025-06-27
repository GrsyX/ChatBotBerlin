import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';

/**
 * App-Komponente
 *
 * Definiert die Routen der Anwendung.
 *
 * @component
 * @returns {JSX.Element} Die Routing-Struktur der Anwendung
 */
const App = () => {
  return (
    <Routes>
      {/* Startseite: Chat */}
      <Route path="/" element={<ChatPage />} />
    </Routes>
  );
};

export default App;