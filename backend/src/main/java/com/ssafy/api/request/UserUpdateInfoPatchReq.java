package com.ssafy.api.request;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ApiModel("UserUpdateInfoPatchReq")
public class UserUpdateInfoPatchReq {
    @ApiModelProperty(name="유저 Name", example="홍길동")
    String name;
    @ApiModelProperty(name="유저 Position", example="교육생")
    String position;
    @ApiModelProperty(name="유저 Department", example="SSAFY")
    String department;

}
