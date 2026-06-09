import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Principal from './pages/Principal';


function App() {
  return (
    <Router>
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route path="/principal" element={<Principal />} />

        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="*" element={<Navigate to="/login" replace />} />

      </Routes>
    </Router>
  );
}

export default App;