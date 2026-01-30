package com.cony.manage.domain.room.entity;

import com.cony.manage.domain.room.enums.RoomRole;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "ROOM_MEMBER", uniqueConstraints = {
        @UniqueConstraint(name = "uk_room_member_room_id_user_id", columnNames = { "room_id", "user_id" })
})
public class RoomMember extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_member_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoomRole role;

    // === 비즈니스 로직 === //
    public void changeRole(RoomRole newRole) {
        this.role = newRole;
    }
}
