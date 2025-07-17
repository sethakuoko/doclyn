package com.doclyn.Doclyn.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    
    @Id
    @Column(name = "id", length = 200)
    private String id;
    
    @Column(name = "fullName", length = 100)
    private String fullName;
    
    @Column(name = "email", length = 100)
    private String email;
} 