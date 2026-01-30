package com.cony.manage.domain.geofence.entity;

import com.cony.manage.domain.gifticon.entity.Brand;
import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;

@Entity
@Getter @Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "store_location", indexes = {
        @Index(name = "idx_store_geom", columnList = "geom", unique = false) // 공간 인덱스 필수
})
public class Store {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private Brand brand;

    @Column(name = "original_name")
    private String storeName;
    @Column(name = "address_road")
    private String address;

    // SRID 4326 (WGS84 - 위경도) 사용
    @Column(columnDefinition = "POINT SRID 4326", nullable = false)
//    @Column(nullable = false) // 테스트용
    private Point geom;
}
