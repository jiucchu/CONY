package com.cony.manage.domain.room.repository;

import com.cony.manage.domain.room.entity.RoomMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RoomMemberRepository extends JpaRepository<RoomMember, Long> {

    @Query("SELECT rm FROM RoomMember rm JOIN FETCH rm.room r WHERE rm.user.id = :userId")
    List<RoomMember> findAllByUserId(@Param("userId") Long userId);

    boolean existsByRoomIdAndUserId(Long roomId, Long userId);

    Optional<RoomMember> findByRoomIdAndUserId(Long roomId, Long userId);

    @Query("SELECT rm.room.id, COUNT(rm) FROM RoomMember rm WHERE rm.room.id IN :roomIds GROUP BY rm.room.id")
    List<Object[]> countMembersByRoomIds(@Param("roomIds") List<Long> roomIds);
}
