package com.ticketing.system.dto;

import com.ticketing.system.entity.Priority;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketRequest {

    @NotBlank
    private String subject;

    @NotBlank
    private String description;

    private Priority priority;
}
