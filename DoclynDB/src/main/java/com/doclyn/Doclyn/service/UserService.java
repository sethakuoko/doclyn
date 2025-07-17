package com.doclyn.Doclyn.service;

import com.doclyn.Doclyn.dto.UserLoginRequest;
import com.doclyn.Doclyn.dto.UserLoginResponse;
import com.doclyn.Doclyn.entity.User;
import com.doclyn.Doclyn.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    @Autowired
    private UserRepository userRepository;
    
    public UserLoginResponse processUserLogin(UserLoginRequest request) {
        try {
            // Check if user already exists
            User existingUser = userRepository.findById(request.getId()).orElse(null);
            
            if (existingUser != null) {
                // User exists, update their information
                existingUser.setEmail(request.getEmail());
                existingUser.setFullName(request.getFullName());
                userRepository.save(existingUser);
                
                return new UserLoginResponse(
                    "User login successful",
                    true,
                    existingUser.getId(),
                    existingUser.getEmail(),
                    existingUser.getFullName()
                );
            } else {
                // Create new user
                User newUser = new User(
                    request.getId(),
                    request.getFullName(),
                    request.getEmail()
                );
                
                User savedUser = userRepository.save(newUser);
                
                return new UserLoginResponse(
                    "User created and login successful",
                    true,
                    savedUser.getId(),
                    savedUser.getEmail(),
                    savedUser.getFullName()
                );
            }
        } catch (Exception e) {
            return new UserLoginResponse(
                "Error processing login: " + e.getMessage(),
                false,
                null,
                null,
                null
            );
        }
    }
} 