package com.example.WebChatReact;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public boolean registerUser(User user) {
        // Poți adăuga validări suplimentare sau criptarea parolei
        userRepository.save(user);
        return true;
    }

}
