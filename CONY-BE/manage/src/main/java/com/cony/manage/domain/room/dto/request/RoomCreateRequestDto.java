package com.cony.manage.domain.room.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class RoomCreateRequestDto {
    @NotBlank(message = "방 이름은 필수입니다.")
    private String name;

    public RoomCreateRequestDto(String name) {
        this.name = name;
    }
}
