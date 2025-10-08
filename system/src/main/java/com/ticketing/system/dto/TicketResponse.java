package com.ticketing.system.dto;

import com.ticketing.system.entity.Priority;
import com.ticketing.system.entity.Status;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TicketResponse {

    private Long id;
    private String subject;
    private String description;
    private Priority priority;
    private Status status;
    private UserResponse creator;
    private UserResponse assignee;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Integer rating;
    private String feedback;
    private List<CommentResponse> comments;
    private List<AttachmentResponse> attachments;
}
