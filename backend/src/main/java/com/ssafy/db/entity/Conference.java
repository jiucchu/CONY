package com.ssafy.db.entity;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
public class Conference extends BaseEntity {
    @Column(name = "call_start_time")
    LocalDateTime callStartTime;
    @Column(name = "call_end_time")
    LocalDateTime callEndTime;
    @Column(name = "thumbnail_url")
    String thumbnailUrl;
    String title;
    String description;
    @Column(name = "is_active")
    Boolean isActive;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    User owner;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conference_category")
    ConferenceCategory conferenceCategory;
}
