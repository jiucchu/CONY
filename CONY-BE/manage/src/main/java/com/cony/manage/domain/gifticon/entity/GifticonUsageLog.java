package com.cony.manage.domain.gifticon.entity;

import com.cony.manage.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "GIFTICON_USAGE_LOG")
public class GifticonUsageLog extends BaseTimeEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gifticon_id", nullable = false)
    private Gifticon gifticon;

    private boolean isCanceled;
    private Integer usedAmount;
    private Integer balanceAfterUse;

    @Builder
    public GifticonUsageLog(Gifticon gifticon, Integer usedAmount, Integer balanceAfterUse) {
        this.gifticon = gifticon;
        this.usedAmount = usedAmount;
        this.balanceAfterUse = balanceAfterUse;
    }

    public void cancel() {
        this.isCanceled = true;
    }

    public void updateAmount(Integer newUsedAmount, Integer newBalanceAfterUse) {
        this.usedAmount = newUsedAmount;
        this.balanceAfterUse = newBalanceAfterUse;
    }
}
