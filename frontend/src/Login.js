import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory
import 'bootstrap/dist/css/bootstrap.min.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState(''); // State for error messages
    const navigate = useNavigate(); // Use the navigate hook

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = {
            username,
            password,
        };

        try {
            const response = await fetch('http://localhost:8080/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            const data = await response.text();  // Use response.text() instead of response.json()

            console.log('Login Response:', data);  // Verifica ce primești de la server

            // If login is successful and we receive the token
            if (response.ok && data) {
                // Save the token in localStorage
                localStorage.setItem('jwtToken', data);

                // Navigate to chat page
                navigate("/chat");
            } else {
                // Display the error message returned by the server
                setErrorMessage(data.message || "Login failed. Please check your credentials.");
            }
        } catch (error) {
            console.error('Error:', error);
            setErrorMessage('An error occurred while trying to login.');
        }
    };

    return (
        <div className="container-fluid bg-light vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#ECE5DD' }}>
            <div className="card shadow border-0 p-5" style={{ maxWidth: '400px', width: '100%', borderRadius: '20px' }}>
                <div className="text-center mb-4">
                    <h2 className="mt-3" style={{ color: '#128C7E', fontWeight: 'bold' }}>Logare</h2>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label" style={{ color: '#128C7E' }}>Username:</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ borderRadius: '20px' }}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label" style={{ color: '#128C7E' }}>Password:</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ borderRadius: '20px' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn w-100 mb-2"
                        style={{ backgroundColor: '#25D366', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}
                    >
                        Login
                    </button>
                </form>
                {/* Error message */}
                {errorMessage && (
                    <div className="alert alert-danger mt-3" role="alert">
                        {errorMessage}
                    </div>
                )}
                <div className="text-center">
                    <p className="mb-1" style={{ color: '#128C7E', marginTop: 20 }}>Nu ai cont?</p>
                    <button
                        className="btn w-100"
                        style={{ backgroundColor: '#128C7E', color: 'white', borderRadius: '20px', fontWeight: 'bold' }}
                        onClick={() => navigate('/register')}
                    >
                        Înregistrare
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
