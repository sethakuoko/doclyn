package com.doclyn.Doclyn.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginResponse {
    private String message;
    private boolean success;
    private String id;
    private String email;
    private String fullName;
} 