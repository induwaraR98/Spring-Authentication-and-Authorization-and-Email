package com.example.test.project.controller;

import com.example.test.project.model.Users;
import com.example.test.project.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService service;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Users user) {
        try {
            Users registeredUser = service.register(user);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (Exception ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", ex.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Users user) {
        String token = service.verify(user);
        if ("fail".equals(token)) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", "Invalid username or password");
            return new ResponseEntity<>(errorResponse, HttpStatus.UNAUTHORIZED);
        }
        
        Users dbUser = service.getUserByUsername(user.getUsername());
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", token);
        response.put("username", dbUser.getUsername());
        response.put("role", dbUser.getRole());
        response.put("email", dbUser.getEmail());
        response.put("id", dbUser.getId());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        
        Users dbUser = service.getUserByUsername(username);
        if (dbUser == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(dbUser);
    }

    // Get all users
    @GetMapping("/all")
    public List<Users> getAllUsers() {
        return service.getAllUsers();
    }

    // Get user by ID
    @GetMapping("/{id}")
    public ResponseEntity<Users> getUserById(@PathVariable int id) {
        Optional<Users> user = service.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    // Delete user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable int id) {
        boolean isDeleted = service.deleteUser(id);
        return isDeleted ? new ResponseEntity<>(HttpStatus.NO_CONTENT) : new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestBody Users updatedData) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String currentUsername;
        if (principal instanceof UserDetails) {
            currentUsername = ((UserDetails) principal).getUsername();
        } else {
            currentUsername = principal.toString();
        }
        
        try {
            Users updatedUser = service.updateProfile(currentUsername, updatedData);
            
            String token = service.generateTokenForUser(updatedUser.getUsername());
            
            java.util.Map<String, Object> response = new java.util.HashMap<>();
            response.put("token", token);
            response.put("username", updatedUser.getUsername());
            response.put("role", updatedUser.getRole());
            response.put("email", updatedUser.getEmail());
            response.put("id", updatedUser.getId());
            response.put("phoneNumber", updatedUser.getPhoneNumber());
            
            return ResponseEntity.ok(response);
        } catch (Exception ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", ex.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> adminUpdateUser(@PathVariable int id, @RequestBody Users updatedData) {
        try {
            Users updatedUser = service.adminUpdateUser(id, updatedData);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", ex.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/admin-create")
    public ResponseEntity<?> adminCreateUser(@RequestBody Users user) {
        try {
            Users registeredUser = service.register(user);
            return new ResponseEntity<>(registeredUser, HttpStatus.CREATED);
        } catch (Exception ex) {
            java.util.Map<String, String> errorResponse = new java.util.HashMap<>();
            errorResponse.put("error", ex.getMessage());
            return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
        }
    }
}
