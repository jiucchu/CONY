package com.cony.manage.domain.geofence.repository;

import com.cony.manage.domain.geofence.entity.Store;
import io.lettuce.core.dynamic.annotation.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {

    /**
     * [핵심 쿼리]
     * 1. 사용자가 가진 브랜드(brandIds)에 속하고
     * 2. 내 위치(userLon, userLat) 반경 maxRadius 미터 안에 있는 매장을
     * 3. 가까운 순서대로 정렬하여 limit 개수만큼 반환
     *
     * MBR(사각형)로 1차 필터링(Index Scan) -> ST_Distance_Sphere로 2차 정밀 필터링 & 거리 계산
     */
    @Query(value = """
        SELECT s.*, 
               ST_Distance_Sphere(s.geom, ST_GeomFromText(CONCAT('POINT(', :lon, ' ', :lat, ')'), 4326)) as dist 
        FROM store_location s
        WHERE s.brand_id IN :brandIds
          AND MBRContains(ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326), s.geom) 
          AND ST_Distance_Sphere(s.geom, ST_GeomFromText(CONCAT('POINT(', :lon, ' ', :lat, ')'), 4326)) <= :maxRadius
        ORDER BY dist ASC
        LIMIT :limit
    """, nativeQuery = true)
    List<StoreWithDistance> findStoresByMBR(
            @Param("brandIds") List<Long> brandIds,
            @Param("minLat") double minLat, @Param("minLon") double minLon,
            @Param("maxLat") double maxLat, @Param("maxLon") double maxLon, // MBR 좌표
            @Param("lon") double userLon, @Param("lat") double userLat,     // 중심 좌표
            @Param("maxRadius") int maxRadius,
            @Param("limit") int limit);
}
