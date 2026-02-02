package com.cony.manage.domain.room.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "방 생성 요청 데이터")
public class RoomCreateRequestDto {
    @NotBlank(message = "방 이름은 필수입니다.")
    @Schema(description = "방 이름", example = "우리 가족 기프티콘 방")
    private String name;

    public RoomCreateRequestDto(String name) {
        this.name = name;
    }
}
