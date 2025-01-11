import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode'; // Importă jwtDecode

const PrivateRoute = ({ element, ...rest }) => {
    const token = localStorage.getItem('jwtToken');

    // Dacă nu există token, redirecționează către login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    try {
        // Decodifică tokenul
        const decodedToken = jwtDecode(token);

        // Verifică dacă tokenul a expirat
        if (decodedToken.exp * 1000 < Date.now()) {
            // Dacă tokenul a expirat, redirecționează către login
            localStorage.removeItem('jwtToken');
            return <Navigate to="/login" replace />;
        }
    } catch (error) {
        console.error('Invalid token', error);
        localStorage.removeItem('jwtToken');
        return <Navigate to="/login" replace />;
    }

    // Dacă tokenul este valid, permite accesul la componenta dorită
    return element;
};

export default PrivateRoute;
