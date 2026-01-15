package com.ssafy.db.entity;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

/**
 * 컨퍼런스(방) 모델 정의.
 */
@Entity
@Getter
@Setter
public class Conference extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conference_category_id")
    ConferenceCategory conferenceCategory;

    String title;
    String description;
    
    @Column(name = "is_active")
    Boolean isActive;
    
    LocalDateTime callStartTime;
    LocalDateTime callEndTime;
    String thumbnailUrl;
}
