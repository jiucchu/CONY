package com.cony.manage.domain.gifticon.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class NearbyBrandIdsResponse {
    private List<Integer> within200;
    private List<Integer> within500;
    private List<Integer> within1000;
}
