package com.doclyn.Doclyn.service;

import com.doclyn.Doclyn.dto.UserLoginRequest;
import com.doclyn.Doclyn.dto.UserLoginResponse;
import com.doclyn.Doclyn.entity.User;
import com.doclyn.Doclyn.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserLoginResponse processUserLogin(UserLoginRequest request) {
        String email = request.getEmail();
        String password = request.getPassword();
        String action = request.getAction();

        Optional<User> existingUser = userRepository.findByEmail(email);

        if ("createAccount".equals(action)) {
            if (existingUser.isPresent()) {
                return new UserLoginResponse("Account with this email already exists.", false);
            } else {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setPassword(password);
                userRepository.save(newUser);
                return new UserLoginResponse("Account created successfully!", true);
            }
        } else if ("signIn".equals(action)) {
            if (existingUser.isPresent() && existingUser.get().getPassword().equals(password)) {
                return new UserLoginResponse("Login successful!", true);
            } else {
                return new UserLoginResponse("Invalid email or password.", false);
            }
        } else {
            return new UserLoginResponse("Invalid action specified.", false);
        }
    }
}