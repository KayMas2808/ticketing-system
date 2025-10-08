package com.ticketing.system.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AttachmentResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private UserResponse uploadedBy;
    private LocalDateTime uploadedAt;
}