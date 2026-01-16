package com.ssafy.db.entity;

import javax.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

/**
 * 컨퍼런스 카테고리 모델 정의.
 */
@Entity
@Getter
@Setter
public class ConferenceCategory extends BaseEntity {
    String name;
}
