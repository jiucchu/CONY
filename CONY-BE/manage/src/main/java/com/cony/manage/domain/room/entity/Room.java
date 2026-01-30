package com.cony.manage.domain.room.entity;

import com.cony.manage.domain.room.enums.RoomType;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "shared_room")
public class Room extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shared_room_id")
    private Long id;

    @Column(name = "room_name", nullable = false)
    private String name;

    @Column(name = "room_code", unique = true)
    private String roomCode;

    @Column(name = "max_members")
    private Integer maxMembers;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User owner;

    // === 비즈니스 로직 === //
    public void updateName(String name) {
        this.name = name;
    }
}
