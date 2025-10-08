package com.ticketing.system.dto;

import com.ticketing.system.entity.Role;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long userId;
    private String email;
    private String name;
    private Role role;
}
