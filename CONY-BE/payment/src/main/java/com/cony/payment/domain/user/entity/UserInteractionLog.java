package com.cony.payment.domain.user.entity;

import com.cony.payment.global.entity.BaseTimeEntity;
import com.cony.payment.domain.sale.entity.Sale;
import com.cony.payment.domain.user.enums.EventType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserInteractionLog extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interaction_id")
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false, length = 20)
    private EventType eventType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sale_id", nullable = false)
    private Sale sale;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Builder
    public UserInteractionLog(User user, Sale sale, EventType eventType) {
        this.user = user;
        this.sale = sale;
        this.eventType = eventType;
    }
}
