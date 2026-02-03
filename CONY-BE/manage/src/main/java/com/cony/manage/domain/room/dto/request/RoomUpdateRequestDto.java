package com.cony.manage.domain.room.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Schema(description = "방 이름 수정 요청 데이터")
public class RoomUpdateRequestDto {

    @NotBlank(message = "변경할 방 이름은 필수입니다.")
    @Schema(description = "변경할 방 이름", example = "수정된 방 이름")
    private String name;
}
