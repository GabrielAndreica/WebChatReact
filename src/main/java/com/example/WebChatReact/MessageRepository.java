package com.example.WebChatReact;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    // Metodă pentru a obține mesajele pe baza roomId-ului
    List<Message> findByRoomId(Long roomId);
    void deleteByRoomId(Long roomId);

}
