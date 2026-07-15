package com.example.test.project.service;

import com.example.test.project.model.Users;
import com.example.test.project.repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    @Autowired
    private UserRepo repo;

    @Autowired
    AuthenticationManager authManager;

    @Autowired
    JWTService jwtService;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(10);

    public Users register(Users user) {
        if (repo.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        if (user.getEmail() != null && !user.getEmail().isEmpty() && repo.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already taken");
        }
        user.setPassword(encoder.encode(user.getPassword()));
        
        // Role assignment: set to ADMIN if explicitly requested, default to USER
        if (user.getRole() != null && user.getRole().equalsIgnoreCase("ADMIN")) {
            user.setRole("ADMIN");
        } else {
            user.setRole("USER");
        }
        return repo.save(user);
    }

    public Users getUserByUsername(String username) {
        return repo.findByUsername(username);
    }

    // Get all users
    public List<Users> getAllUsers() {
        return repo.findAll();
    }

    // Get user by ID
    public Optional<Users> getUserById(int id) {
        return repo.findById(id);
    }

    // Delete user by ID
    public boolean deleteUser(int id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return true;
        }
        return false;
    }

    public String verify(Users user) {
        Authentication authentication = authManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        if (authentication.isAuthenticated()) {
            return jwtService.generateToken(user.getUsername());
        }
        return "fail";
    }

    public Users updateProfile(String currentUsername, Users updatedData) {
        Users current = repo.findByUsername(currentUsername);
        if (current == null) {
            throw new RuntimeException("User not found");
        }
        
        if (!current.getUsername().equals(updatedData.getUsername())) {
            if (repo.existsByUsername(updatedData.getUsername())) {
                throw new RuntimeException("Username is already taken");
            }
            current.setUsername(updatedData.getUsername());
        }
        
        if (updatedData.getEmail() != null && !updatedData.getEmail().isEmpty() && !updatedData.getEmail().equalsIgnoreCase(current.getEmail())) {
            if (repo.existsByEmail(updatedData.getEmail())) {
                throw new RuntimeException("Email is already taken");
            }
            current.setEmail(updatedData.getEmail());
        }
        
        current.setPhoneNumber(updatedData.getPhoneNumber());
        
        if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
            current.setPassword(encoder.encode(updatedData.getPassword()));
        }
        
        return repo.save(current);
    }

    public Users adminUpdateUser(int id, Users updatedData) {
        Optional<Users> optionalUser = repo.findById(id);
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }
        Users current = optionalUser.get();
        
        if (!current.getUsername().equals(updatedData.getUsername())) {
            if (repo.existsByUsername(updatedData.getUsername())) {
                throw new RuntimeException("Username is already taken");
            }
            current.setUsername(updatedData.getUsername());
        }
        
        if (updatedData.getEmail() != null && !updatedData.getEmail().isEmpty() && !updatedData.getEmail().equalsIgnoreCase(current.getEmail())) {
            if (repo.existsByEmail(updatedData.getEmail())) {
                throw new RuntimeException("Email is already taken");
            }
            current.setEmail(updatedData.getEmail());
        }
        
        current.setPhoneNumber(updatedData.getPhoneNumber());
        
        if (updatedData.getPassword() != null && !updatedData.getPassword().isEmpty()) {
            current.setPassword(encoder.encode(updatedData.getPassword()));
        }
        
        if (updatedData.getRole() != null && (updatedData.getRole().equalsIgnoreCase("ADMIN") || updatedData.getRole().equalsIgnoreCase("USER"))) {
            current.setRole(updatedData.getRole().toUpperCase());
        }
        
        return repo.save(current);
    }

    public String generateTokenForUser(String username) {
        return jwtService.generateToken(username);
    }
}
