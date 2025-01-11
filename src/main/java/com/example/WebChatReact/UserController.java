package com.example.WebChatReact;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserDetailsService userDetailsService;

    @PostMapping("/register")
    public String registerUser(@RequestBody User user) {
        boolean isRegistered = userService.registerUser(user);
        return isRegistered ? "User registered successfully!" : "Registration failed!";
    }

    @PostMapping("/login")
    public String login(@RequestBody User user) {
        // Verificarea existenței utilizatorului în baza de date
        Optional<User> optionalUser = userRepository.findByUsername(user.getUsername());  // Obținem Optional<User>

        // Dacă utilizatorul există și parola este corectă
        if (optionalUser.isPresent() && optionalUser.get().getPassword().equals(user.getPassword())) {
            User existingUser = optionalUser.get();  // Extragem User din Optional

            // Generarea tokenului JWT
            String token = jwtUtil.generateToken(existingUser.getUsername(), existingUser.getRole());

            // Afișarea tokenului în consola serverului
            System.out.println("Token generat: " + token);
            return token;  // Trimite tokenul ca răspuns
        }

        return "Invalid username or password";  // Dacă datele sunt incorecte
    }

}
