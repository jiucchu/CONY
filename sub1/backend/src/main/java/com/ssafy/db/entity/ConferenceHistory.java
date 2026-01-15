package com.ssafy.db.entity;

import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import java.time.LocalDateTime;
import javax.persistence.PrePersist;

import lombok.Getter;
import lombok.Setter;

/**
 * 컨퍼런스 이력 모델 정의.
 */
@Entity
@Getter
@Setter
public class ConferenceHistory extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conference_id")
    Conference conference;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;

    Integer action; // 1:CREATE, 2:JOIN, 3:EXIT
    LocalDateTime insertedTime;

    @PrePersist
    public void prePersist() {
        this.insertedTime = LocalDateTime.now();
    }
}
