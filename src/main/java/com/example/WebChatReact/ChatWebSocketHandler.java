package com.example.WebChatReact;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.socket.TextMessage;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ChatWebSocketHandler extends TextWebSocketHandler {

    @Autowired
    private MessageService messageService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        // Logică pentru când conexiunea este deschisă
        System.out.println("Conexiune WebSocket deschisă: " + session.getId());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // Creează un obiect Message
        Message newMessage = new Message();
        newMessage.setSender("User"); // Poți să setezi un nume de utilizator
        newMessage.setText(message.getPayload());
        newMessage.setTimestamp(LocalDateTime.now());

        // Salvează mesajul în baza de date
        messageService.saveMessage(newMessage);

        // Trimite un răspuns înapoi la client
        session.sendMessage(new TextMessage("Mesajul a fost primit!"));
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        // Logică pentru a gestiona erorile de transport
        System.out.println("Eroare WebSocket: " + exception.getMessage());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus closeStatus) throws Exception {
        // Logică pentru când conexiunea este închisă
        System.out.println("Conexiune WebSocket închisă: " + session.getId());
    }
}