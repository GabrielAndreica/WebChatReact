import React, { useState, useEffect } from 'react';
import './App.css';
import "bootstrap/dist/css/bootstrap.min.css";
import {Navigate, useNavigate} from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { Dropdown } from 'react-bootstrap';


function Chat() {
    const [showAddRoomModal, setShowAddRoomModal] = useState(false);

    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [chatRooms, setChatRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [roomPassword, setRoomPassword] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [passwordInput, setPasswordInput] = useState('');
    const [isPasswordValid, setIsPasswordValid] = useState(null);
    const [roomBeingEdited, setRoomBeingEdited] = useState(null);  // pentru editarea camerei
    const [socket, setSocket] = useState(null); // WebSocket connection
    const [currentRoom, setCurrentRoom] = useState(null);  // Pentru a ține evidența camerei curente
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [jwtToken, setJwtToken] = useState('');
    const [rooms, setRooms] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userRole, setUserRole] = useState(''); // 'admin', 'user', etc.
    const [authenticatedUserName, setAuthenticatedUserName] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [passwordError, setPasswordError] = useState(""); // Starea pentru eroarea de parolă
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(false); // Starea pentru a arăta sau nu promptul de parolă
    const [roomToJoin, setRoomToJoin] = useState(null);

    // Funcție pentru trimiterea mesajului
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (message.trim() !== '') {
            const messageData = {
                sender: authenticatedUserName,  // Poți înlocui cu numele utilizatorului din contextul aplicației
                text: message,
                room: currentRoom,  // Asociem mesajul cu camera curentă
                timestamp: new Date().toISOString(),
            };

            // Trimiterea cererii POST pentru a salva mesajul în backend
            try {
                const response = await fetch('http://localhost:8080/api/messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(messageData),
                });

                if (response.ok) {
                    // Dacă mesajul a fost salvat cu succes, actualizează lista de mesaje
                    const savedMessage = await response.json();
                    setMessages([...messages, savedMessage]);
                    setMessage('');  // Resetează câmpul de input
                } else {
                    console.error('Error saving message');
                }
            } catch (error) {
                console.error('Error sending message', error);
            }
        }
    };

    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('jwtToken'); // Șterge token-ul JWT
        navigate('/login'); // Redirecționează utilizatorul către pagina de login
    };

    // Funcție pentru a încerca să intri într-o cameră
    const handleJoinRoomWithPassword = async (roomId, password) => {
        const room = chatRooms.find((r) => r.id === roomId);

        if (room && room.private) {
            // Dacă este cameră privată, verificăm parola
            if (room.password !== password) {
                setPasswordError("Parola este incorectă!");
                return;
            }
        }

        // Dacă parola este corectă (sau nu este necesară), intrăm în cameră
        handleJoinRoom(roomId);
        setShowPasswordPrompt(false); // Închide promptul de parolă
        setRoomPassword(""); // Resetează parola
    };

    const promptPassword = (roomId) => {
        // Dacă este o cameră privată, arată promptul de parolă
        setRoomToJoin(roomId);
        setShowPasswordPrompt(true);
        setPasswordError(""); // Resetează eventualele erori
    };

    const handleAddRoom = async () => {
        if (newRoomName.trim() !== '') {
            const roomData = {
                name: newRoomName,
                isPrivate: isPrivate, // Asigură-te că este corect setat
                password: isPrivate ? roomPassword : '',
            };

            console.log("Sending room data:", roomData);  // Verifică datele trimise

            try {
                const response = await fetch('http://localhost:8080/api/rooms', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(roomData),
                });

                if (response.ok) {
                    const room = await response.json();
                    setChatRooms([...chatRooms, room]);
                    setNewRoomName('');
                    setRoomPassword('');
                    setShowAddRoom(false);
                } else {
                    console.error('Error adding room');
                }
            } catch (error) {
                console.error('Error adding room', error);
            }
        }
    };

    const handleJoinRoom = async (roomId) => {
        console.log(`Încep conectarea la WebSocket pentru camera ${roomId}...`);

        // Închiderea conexiunii WebSocket existentă
        if (socket) {
            socket.close();
        }

        // Căutăm camera selectată din lista de camere
        const room = chatRooms.find(r => r.id === roomId);
        if (room) {
            // Creăm o conexiune WebSocket
            const ws = new WebSocket(`ws://localhost:8080/rooms/${roomId}`);

            ws.onopen = () => {
                console.log(`Conexiune WebSocket deschisă pentru camera ${roomId}`);
            };

            ws.onmessage = (event) => {
                console.log("Mesaj primit de la server:", event.data);
                setMessages(prevMessages => [...prevMessages, { sender: 'Server', text: event.data }]);
            };

            ws.onerror = (error) => {
                console.error("Eroare WebSocket:", error);
            };

            ws.onclose = () => {
                console.log(`Conexiune WebSocket închisă pentru camera ${roomId}`);
            };

            setSocket(ws);
            setCurrentRoom(room);

            // Obține mesajele pentru camera curentă din backend
            try {
                const response = await fetch(`http://localhost:8080/api/messages/room/${roomId}`);
                if (response.ok) {
                    const roomMessages = await response.json();
                    setMessages(roomMessages);  // Setăm mesajele pentru această cameră
                } else {
                    console.error('Error fetching messages');
                }
            } catch (error) {
                console.error('Error fetching messages', error);
            }
        }
    };
    const testWebSocket = () => {
        const socket = new WebSocket('ws://localhost:8080/test'); // Adresa de test a WebSocket-ului

        socket.onopen = () => {
            console.log('WebSocket connected');
            socket.send('Hello Server!');
        };

        socket.onmessage = (event) => {
            console.log('Message from server: ', event.data);
        };

        socket.onerror = (error) => {
            console.error('WebSocket error: ', error);
        };

        socket.onclose = () => {
            console.log('WebSocket closed');
        };
    };

    // Utilizează useEffect pentru a încarca camerele de chat la inițializare
    useEffect(() => {

        const token = localStorage.getItem('jwtToken');

        if (token) {
            try {
                // Decodificăm token-ul JWT
                const decodedToken = JSON.parse(atob(token.split('.')[1]));  // Extrage și decodează partea payload a token-ului
                console.log("Decoded Token Payload:", decodedToken);  // Loghează token-ul decodat pentru a vizualiza structura

                // Extragem rolul și numele utilizatorului din token
                const userRole = decodedToken.role;  // Extragem rolul din claims
                const userName = decodedToken.sub;  // Extragem username-ul din sub

                // Setăm variabilele de stare corespunzătoare
                setAuthenticatedUserName(userName);  // Setează username-ul
                setUserRole(userRole);  // Setează rolul
                setIsAuthenticated(true);  // Setează starea de autentificare
            } catch (error) {
                console.error("Eroare la decodificarea token-ului JWT:", error);
            }
        } else {
            console.log("Token-ul nu a fost găsit.");
        }

        const fetchRooms = async () => {
            try {
                const response = await fetch('http://localhost:8080/api/rooms');
                if (!response.ok) {
                    throw new Error('Failed to fetch rooms');
                }
                const data = await response.json();
                setChatRooms(data);  // Actualizează starea camerelor de chat
            } catch (error) {
                setError(error.message);  // Setează eroarea în caz de eșec
            } finally {
                setIsLoading(false);  // Oprește indicatorul de încărcare
            }
        };

        fetchRooms();
    }, []);

    // Funcție pentru a edita o cameră
    const handleEditRoom = (room) => {
        setRoomBeingEdited(room);
        setNewRoomName(room.name);
        setIsPrivate(room.isPrivate);
        setRoomPassword(room.password || '');
    };

    // Funcție pentru a salva modificările unei camere
    const handleSaveEditRoom = async () => {
        if (roomBeingEdited) {
            try {
                const response = await fetch(`http://localhost:8080/api/rooms/${roomBeingEdited.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: newRoomName,
                        isPrivate,
                        password: isPrivate ? roomPassword : '',
                    }),
                });

                if (response.ok) {
                    const updatedRoom = await response.json();
                    setChatRooms(chatRooms.map(room => room.id === updatedRoom.id ? updatedRoom : room));
                    setRoomBeingEdited(null);
                    setNewRoomName('');
                    setRoomPassword('');
                } else {
                    console.error('Error editing room');
                }
            } catch (error) {
                console.error('Error editing room', error);
            }
        }
    };

    const handleDeleteRoom = async (roomId) => {
        try {
            // Trimite cererea de ștergere către server
            const response = await fetch(`http://localhost:8080/api/rooms/${roomId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                // Actualizează starea chatRooms pentru a reflecta eliminarea camerei
                setChatRooms(chatRooms.filter(room => room.id !== roomId));
            } else {
                console.error('Error deleting room');
            }
        } catch (error) {
            console.error('Error deleting room', error);
        }
    };

    function getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }

    return (
        <div className="container-fluid vh-100 d-flex flex-column bg-light chat-app p-0">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons/font/bootstrap-icons.css" rel="stylesheet"/>

            {/* Header */}
            <header className="d-flex align-items-center justify-content-between px-3 py-2 bg-success text-white">
                <h1 className="mb-0 fs-4"></h1>
                <button className="btn text-light btn-sm d-flex align-items-center" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-3 fs-3"></i> <b>Logout</b>
                </button>
            </header>

            {/* Main content */}
            <div className="row flex-grow-1 ps-3 pe-3">
                <aside className="col-md-4 bg-white border-end p-2 chat-sidebar">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h2 className="fs-4 mb-0">Camerele de Chat</h2>
                        {/* Butonul "+" pentru deschiderea modalului */}
                        {userRole === "admin" && (
                            <button
                                className="btn p-0"
                                onClick={() => setShowAddRoomModal(true)}
                            >
                                <i className="bi bi-plus fs-1" style={{ color: '#212529' }}></i> {/* Iconiță de plus albă din Bootstrap Icons */}
                            </button>
                        )}
                    </div>

                    {/* Lista camerelor de chat */}
                    <ul className="list-group list-group-flush">
                        {chatRooms.map((room) => (
                            <li
                                key={room.id}
                                className="list-group-item p-2 d-flex align-items-center gap-3"
                                onClick={() => (room.private ? promptPassword(room.id) : handleJoinRoom(room.id))}
                                style={{ cursor: "pointer" }}
                            >
                                {/* Avatar cameră */}
                                <div className="room-avatar d-flex align-items-center justify-content-center rounded-circle">
                                    <i className="bi bi-chat-dots text-white fs-4"></i>
                                </div>
                                {/* Detalii cameră */}
                                <div className="flex-grow-1">
                                    <h5 className="mb-0 fs-6 text-truncate d-flex align-items-center">
                                        {room.name}
                                        {room.private && (
                                            <span className="badge bg-danger ms-2">Privată</span>
                                        )}
                                    </h5>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {/* Modal pentru adăugarea camerei */}
                    {showAddRoomModal && (
                        <div>
                            <div className="overlay" onClick={() => setShowAddRoomModal(false)}></div>
                            {/* Fundal întunecat */}
                            <div className="modal fade show" style={{ display: 'block' }}>
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Adaugă Cameră</h5>
                                            <button type="button" className="btn-close" onClick={() => setShowAddRoomModal(false)}></button>
                                        </div>
                                        <div className="modal-body">
                                            <div className="mb-3">
                                                <label htmlFor="roomName" className="form-label">Nume Cameră</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    id="roomName"
                                                    value={newRoomName}
                                                    onChange={(e) => setNewRoomName(e.target.value)}
                                                    placeholder="Introdu numele camerei"
                                                />
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    id="publicRoom"
                                                    checked={!isPrivate}
                                                    onChange={() => setIsPrivate(false)}
                                                />
                                                <label className="form-check-label" htmlFor="publicRoom">
                                                    Publică
                                                </label>
                                            </div>
                                            <div className="form-check">
                                                <input
                                                    className="form-check-input"
                                                    type="radio"
                                                    id="privateRoom"
                                                    checked={isPrivate}
                                                    onChange={() => setIsPrivate(true)}
                                                />
                                                <label className="form-check-label" htmlFor="privateRoom">
                                                    Privată
                                                </label>
                                            </div>
                                            {isPrivate && (
                                                <div className="mt-2">
                                                    <label htmlFor="roomPassword" className="form-label">Parolă Cameră</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="roomPassword"
                                                        placeholder="Introdu parola camerei"
                                                        value={roomPassword}
                                                        onChange={(e) => setRoomPassword(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                        <div className="modal-footer">
                                            <button type="button" className="btn btn-secondary" onClick={() => setShowAddRoomModal(false)}>
                                                Închide
                                            </button>
                                            <button type="button" className="btn btn-primary" onClick={handleAddRoom}>
                                                Salvează Cameră
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <div>
                        {/* Butonul "+" pentru deschiderea modalului */}

                        {/* Modal pentru adăugarea camerei */}
                        {showAddRoomModal && (
                            <div>
                                <div className="overlay" onClick={() => setShowAddRoomModal(false)}></div>
                                {/* Fundal întunecat */}
                                <div className="modal fade show" style={{display: 'block'}}>
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Adaugă Cameră</h5>
                                                <button type="button" className="btn-close"
                                                        onClick={() => setShowAddRoomModal(false)}></button>
                                            </div>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label htmlFor="roomName" className="form-label">Nume Cameră</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="roomName"
                                                        value={newRoomName}
                                                        onChange={(e) => setNewRoomName(e.target.value)}
                                                        placeholder="Introdu numele camerei"
                                                    />
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        id="publicRoom"
                                                        checked={!isPrivate}
                                                        onChange={() => setIsPrivate(false)}
                                                    />
                                                    <label className="form-check-label" htmlFor="publicRoom">
                                                        Publică
                                                    </label>
                                                </div>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        id="privateRoom"
                                                        checked={isPrivate}
                                                        onChange={() => setIsPrivate(true)}
                                                    />
                                                    <label className="form-check-label" htmlFor="privateRoom">
                                                        Privată
                                                    </label>
                                                </div>
                                                {isPrivate && (
                                                    <div className="mt-2">
                                                        <label htmlFor="roomPassword" className="form-label">Parolă
                                                            Cameră</label>
                                                        <input
                                                            type="password"
                                                            className="form-control"
                                                            id="roomPassword"
                                                            placeholder="Introdu parola camerei"
                                                            value={roomPassword}
                                                            onChange={(e) => setRoomPassword(e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary"
                                                        onClick={() => setShowAddRoomModal(false)}>
                                                    Închide
                                                </button>
                                                <button type="button" className="btn btn-primary"
                                                        onClick={handleAddRoom}>
                                                    Salvează Cameră
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Prompt pentru parola */}
                    {showPasswordPrompt && roomToJoin && (
                        <>
                            {/* Overlay pentru întunecarea fundalului */}
                            <div className="overlay" onClick={() => setShowPasswordPrompt(false)}></div>

                            <div className="modal show d-block" tabIndex="-1" style={{display: "block"}}>
                                <div className="modal-dialog">
                                    <div className="modal-content">
                                        <div className="modal-header">
                                            <h5 className="modal-title">Introduceți parola</h5>
                                            <button
                                                type="button"
                                                className="btn-close"
                                                onClick={() => setShowPasswordPrompt(false)}
                                                aria-label="Close"
                                            ></button>
                                        </div>
                                        <div className="modal-body">
                                            <input
                                                type="password"
                                                className="form-control"
                                                placeholder="Parola"
                                                value={roomPassword}
                                                onChange={(e) => setRoomPassword(e.target.value)}
                                            />
                                            {passwordError && (
                                                <div className="text-danger mt-2">{passwordError}</div>
                                            )}
                                        </div>
                                        <div className="modal-footer">
                                            <button
                                                type="button"
                                                className="btn btn-secondary"
                                                onClick={() => setShowPasswordPrompt(false)}
                                            >
                                                Anulează
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => handleJoinRoomWithPassword(roomToJoin, roomPassword)}
                                            >
                                                Intră în cameră
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </aside>

                {/* Chat Section */}
                <main className="col-md-8 d-flex flex-column">
                    {/* Titlul camerei curente cu meniu dropdown */}
                    <div>
                        <div className="d-flex align-items-center justify-content-between pb-3 mb-0 mt-3 border-bottom">
                            <h1 className="fs-4 mb-0 pt-2 pb-2">
                                {currentRoom ? currentRoom.name : "Selecteaza o camera"}
                            </h1>
                            {currentRoom && userRole === 'admin' && (
                                <div className="dropdown">
                                    <Dropdown>
                                        <Dropdown.Toggle variant="secondary-outline" id="dropdown-basic">
                                            <i className="bi bi-three-dots fs-4"></i>
                                        </Dropdown.Toggle>

                                        <Dropdown.Menu>
                                            <Dropdown.Item onClick={() => handleEditRoom(currentRoom)}>
                                                <i className="bi bi-pencil-square me-2"></i> Editare
                                            </Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleDeleteRoom(currentRoom.id)}
                                                           className="text-danger">
                                                <i className="bi bi-trash-fill me-2"></i> Ștergere
                                            </Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown>
                                </div>
                            )}
                        </div>

                        {/* Modal pentru editare */}
                        {roomBeingEdited && (

                            <div>
                                {/* Overlay pentru fundal întunecat */}
                                <div className="overlay" onClick={() => setRoomBeingEdited(null)}></div>

                                {/* Modal pentru editare */}
                                <div className={`modal fade ${roomBeingEdited ? 'show' : ''}`}
                                     style={{display: roomBeingEdited ? 'block' : 'none'}}>
                                    <div className="modal-dialog">
                                        <div className="modal-content">
                                            <div className="modal-header">
                                                <h5 className="modal-title">Editează Camera</h5>
                                                <button type="button" className="btn-close"
                                                        onClick={() => setRoomBeingEdited(null)}></button>
                                            </div>
                                            <div className="modal-body">
                                                <div className="mb-3">
                                                    <label htmlFor="roomName" className="form-label">Nume Cameră</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="roomName"
                                                        value={newRoomName}
                                                        onChange={(e) => setNewRoomName(e.target.value)}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="roomPassword" className="form-label">Parolă
                                                        Cameră</label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="roomPassword"
                                                        value={roomPassword}
                                                        onChange={(e) => setRoomPassword(e.target.value)}
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="roomPrivacy" className="form-label">Tip
                                                        Cameră</label>
                                                    <select
                                                        id="roomPrivacy"
                                                        className="form-select"
                                                        value={isPrivate ? 'private' : 'public'}
                                                        onChange={(e) => setIsPrivate(e.target.value === 'private')}
                                                    >
                                                        <option value="public">Publică</option>
                                                        <option value="private">Privată</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="modal-footer">
                                                <button type="button" className="btn btn-secondary"
                                                        onClick={() => setRoomBeingEdited(null)}>
                                                    Închide
                                                </button>
                                                <button type="button" className="btn btn-primary"
                                                        onClick={handleSaveEditRoom}>
                                                    Salvează Modificările
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex-grow-1 bg-light p-3 chat-messages overflow-auto">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`message ${msg.sender === authenticatedUserName ? 'sent' : 'received'}`}
                            >
                                {msg.sender !== authenticatedUserName && (
                                    <div className="message-bubble">
                                        {/* Bula cu inițiala doar pentru ceilalți utilizatori */}
                                        <div
                                            className="initial"
                                            style={{backgroundColor: '#2196F3'}} // Culoare pentru ceilalți utilizatori
                                        >
                                            {msg.sender[0].toUpperCase()}
                                        </div>
                                        <div className="message-text">
                                            <span className="sender">{msg.sender}</span>
                                            <br/>
                                            {msg.text}
                                        </div>
                                    </div>
                                )}

                                {/* Mesaje trimise de utilizatorul conectat */}
                                {msg.sender === authenticatedUserName && (
                                    <div className="message-text">
                                        {msg.text}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Message input */}
                    <form className="d-flex border-top pt-3 pb-3" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            className="form-control me-2"
                            placeholder="Scrie un mesaj..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button type="submit" className="btn btn-success">
                            Trimite
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
}

export default Chat;
