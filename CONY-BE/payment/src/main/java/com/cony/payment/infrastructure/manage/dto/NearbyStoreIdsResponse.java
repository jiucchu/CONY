package com.cony.payment.infrastructure.manage.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class NearbyStoreIdsResponse {
    private List<Integer> within200;
    private List<Integer> within500;
    private List<Integer> within1000;
}
