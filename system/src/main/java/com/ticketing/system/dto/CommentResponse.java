package com.ticketing.system.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CommentResponse {

    private Long id;
    private String content;
    private UserResponse user;
    private LocalDateTime createdAt;
}
