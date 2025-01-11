import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';
import PrivateRoute from './PrivateRoute'; // Importă componenta PrivateRoute

const App = () => {
    const isAuthenticated = !!localStorage.getItem('jwtToken'); // Verifică dacă există token
    return (
        <Router>
            <div>
                <Routes>
                    <Route
                        path="/"
                        element={isAuthenticated ? <Navigate to="/chat" replace /> : <Navigate to="/login" replace />}
                    />
                    <Route path="/login" element={<Login />} />
                    {/* Ruta protejată pentru /chat */}
                    <Route path="/chat" element={<PrivateRoute element={<Chat />} />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/" element={<h2>Please select an option to login or register.</h2>} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
