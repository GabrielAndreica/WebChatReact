package com.example.WebChatReact;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    @Autowired
    private RoomService roomService;

    @PostMapping
    public Room addRoom(@RequestBody RoomRequest roomRequest) {
        System.out.println("Received RoomRequest: name = " + roomRequest.getName() +
                ", isPrivate = " + roomRequest.isPrivate() +
                ", password = " + roomRequest.getPassword());

        return roomService.addRoom(roomRequest.getName(), roomRequest.isPrivate(), roomRequest.getPassword());
    }

    // Endpoint pentru a obține toate camerele
    @GetMapping
    public List<Room> getAllRooms() {
        return roomService.getAllRooms();
    }

    // Endpoint pentru a verifica parola unei camere private
    @PostMapping("/{roomId}/checkPassword")
    public boolean checkPassword(@PathVariable Long roomId, @RequestBody String password) {
        return roomService.checkPassword(roomId, password);
    }

    // Endpoint pentru a edita o cameră
    @PutMapping("/{roomId}")
    public Room updateRoom(@PathVariable Long roomId, @RequestBody RoomRequest roomRequest) {
        return roomService.updateRoom(roomId, roomRequest.getName(), roomRequest.isPrivate(), roomRequest.getPassword());
    }

    // Endpoint pentru a șterge o cameră
    @DeleteMapping("/{roomId}")
    public void deleteRoom(@PathVariable Long roomId) {
        roomService.deleteRoom(roomId);
    }

    public static class RoomRequest {
        private String name;
        @JsonProperty("isPrivate")
        private boolean isPrivate;
        private String password;

        // Getters și Setters
        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public boolean isPrivate() {
            return isPrivate;
        }

        public void setPrivate(boolean isPrivate) {
            this.isPrivate = isPrivate;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}

