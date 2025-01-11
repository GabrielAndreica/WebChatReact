package com.example.WebChatReact;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class RoomService {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private MessageRepository messageRepository;

    public Room addRoom(String name, boolean isPrivate, String password) {
        Room room = new Room();
        room.setName(name);
        room.setPrivate(isPrivate);  // Asigurați-vă că valoarea este corectă aici
        room.setPassword(password);
        return roomRepository.save(room);  // Sau altă metodă de salvare
    }

    // Metoda pentru a obține toate camerele
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    // Verifică dacă parola introdusă este corectă pentru o cameră privată
    public boolean checkPassword(Long roomId, String password) {
        Room room = roomRepository.findById(roomId).orElse(null);
        if (room != null && room.isPrivate() && room.getPassword().equals(password)) {
            return true;
        }
        return false;
    }

    // Metoda pentru a actualiza o cameră existentă
    public Room updateRoom(Long roomId, String name, boolean isPrivate, String password) {
        Optional<Room> existingRoom = roomRepository.findById(roomId);

        if (existingRoom.isPresent()) {
            Room room = existingRoom.get();
            room.setName(name);
            room.setPrivate(isPrivate);
            room.setPassword(password);
            return roomRepository.save(room);
        } else {
            throw new RuntimeException("Camera cu ID-ul " + roomId + " nu a fost găsită.");
        }
    }

    @Transactional
    public void deleteRoom(Long roomId) {
        if (roomRepository.existsById(roomId)) {
            // Șterge mesajele asociate camerei
            messageRepository.deleteByRoomId(roomId);
            roomRepository.deleteById(roomId);
        } else {
            throw new RuntimeException("Camera cu ID-ul " + roomId + " nu a fost găsită.");
        }
    }
}
