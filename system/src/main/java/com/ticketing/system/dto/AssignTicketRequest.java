package com.ticketing.system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignTicketRequest {

    @NotNull
    private Long assigneeId;
}
