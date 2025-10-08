package com.ticketing.system.dto;

import com.ticketing.system.entity.Role;

import lombok.Data;

@Data
public class UserResponse {

    private Long id;
    private String email;
    private String name;
    private Role role;
}
