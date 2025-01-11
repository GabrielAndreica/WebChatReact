import React, { useState } from 'react';

const Register = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const user = {
            username,
            password,
        };

        try {
            const response = await fetch('http://localhost:8080/api/users/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(user),
            });

            const data = await response.text();
            alert(data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="container-fluid bg-light vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#ECE5DD' }}>
            <div className="card shadow border-0 p-5" style={{ maxWidth: '400px', width: '100%', borderRadius: '15px' }}>
                <div className="text-center mb-4">
                    <h2 className="mt-3" style={{ color: '#128C7E', fontWeight: 'bold' }}>Inregistrare</h2>
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
                            style={{ borderRadius: '10px' }}
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
                            style={{ borderRadius: '10px' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn w-100 mb-2"
                        style={{ backgroundColor: '#25D366', color: 'white', borderRadius: '10px', fontWeight: 'bold' }}
                    >
                        Inregistrare
                    </button>
                </form>
                <div className="text-center">
                    <p className="mb-1" style={{ color: '#128C7E', marginTop: 20,   }}>Ai deja un cont?</p>
                    <button
                        className="btn w-100"
                        style={{ backgroundColor: '#128C7E', color: 'white', borderRadius: '10px', fontWeight: 'bold' }}
                        onClick={() => window.location.href = '/login'}
                    >
                        Logare
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;
