package com.cony.manage.domain.room.entity;

import com.cony.manage.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Table(name = "shared_room")
@EntityListeners(AuditingEntityListener.class)
public class Room {

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

    @CreatedDate
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    private User owner;

    // === 비즈니스 로직 === //
    public void updateName(String name) {
        this.name = name;
    }
}
