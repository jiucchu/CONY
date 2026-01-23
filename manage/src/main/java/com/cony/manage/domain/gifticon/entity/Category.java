package com.cony.manage.domain.gifticon.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class Category {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Integer id;
    @Column(nullable = false, unique = true)
    private String name;
    private String iconUrl;
    private Integer displayOrder;
}
