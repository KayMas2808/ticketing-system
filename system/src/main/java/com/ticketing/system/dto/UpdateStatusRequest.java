package com.ticketing.system.dto;

import com.ticketing.system.entity.Status;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateStatusRequest {

    @NotNull
    private Status status;
}
