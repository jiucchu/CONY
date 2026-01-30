package com.cony.manage.domain.room.service;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.enums.GifticonStatus;
import com.cony.manage.domain.gifticon.repository.GifticonRepository;
import com.cony.manage.domain.room.dto.request.RoomCreateRequestDto;
import com.cony.manage.domain.room.dto.response.GifticonRoomResponseDto;
import com.cony.manage.domain.room.dto.response.RoomResponseDto;
import com.cony.manage.domain.room.entity.Room;
import com.cony.manage.domain.room.entity.RoomMember;
import com.cony.manage.domain.room.enums.GifticonSearchStatus;
import com.cony.manage.domain.room.enums.RoomRole;
import com.cony.manage.domain.room.repository.RoomMemberRepository;
import com.cony.manage.domain.room.repository.RoomRepository;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMemberRepository roomMemberRepository;
    private final UserRepository userRepository;
    private final GifticonRepository gifticonRepository;

    // 내 방 목록 조회
    public List<RoomResponseDto> getMyRooms(Long userId) {
        List<RoomMember> members = roomMemberRepository.findAllByUserId(userId);

        // 정렬: 최신순 (생성일 기준 내림차순)
        return members.stream()
                .sorted(Comparator.comparing((RoomMember rm) -> rm.getRoom().getCreatedAt()).reversed())
                .map(rm -> {
                    Room room = rm.getRoom();
                    // 현재는 멤버 수를 하드코딩하거나 별도 쿼리가 필요함
                    // MVP 최적화를 위해 추후 구현 예정
                    return RoomResponseDto.of(room, 1, List.of());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public Long createRoom(Long userId, RoomCreateRequestDto requestDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        Room room = Room.builder()
                .name(requestDto.getName())
                .owner(user)
                .roomCode(UUID.randomUUID().toString().substring(0, 8))
                .maxMembers(10) // 기본값 10명 설정
                .build();

        roomRepository.save(room);

        RoomMember roomMember = RoomMember.builder()
                .room(room)
                .user(user)
                .role(RoomRole.OWNER)
                .build();

        roomMemberRepository.save(roomMember);

        return room.getId();
    }

    public RoomResponseDto getRoomDetail(Long userId, Long roomId) {
        RoomMember member = checkRoomAccess(userId, roomId);
        Room room = member.getRoom();
        return RoomResponseDto.of(room, 1, List.of());
    }

    public Page<GifticonRoomResponseDto> getGifticonsInRoom(Long userId, Long roomId,
            GifticonSearchStatus status,
            String keyword,
            Pageable pageable) {
        checkRoomAccess(userId, roomId);

        Specification<Gifticon> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. 방 ID
            predicates.add(cb.equal(root.get("room").get("id"), roomId)); // Room.id (shared_room_id)

            // 2. 키워드 검색
            if (keyword != null && !keyword.isBlank()) {
                String likePattern = "%" + keyword + "%";
                predicates.add(cb.or(
                        cb.like(root.get("brandName"), likePattern),
                        cb.like(root.get("productName"), likePattern)));
            }

            // 3. 상태 필터링
            if (status != null) {
                switch (status) {
                    case AVAILABLE:
                        // 사용 가능: (NOT_USED, IN_USE) 상태이고 만료되지 않음
                        predicates.add(root.get("status").in(
                                GifticonStatus.NOT_USED,
                                GifticonStatus.IN_USE));
                        predicates.add(cb.greaterThanOrEqualTo(root.get("expiryDate"), LocalDate.now()));
                        break;
                    case USED:
                        // 사용 완료: USED 상태이거나 만료됨
                        Predicate isUsed = cb.equal(root.get("status"), GifticonStatus.USED);
                        Predicate isExpired = cb.lessThan(root.get("expiryDate"), LocalDate.now());
                        predicates.add(cb.or(isUsed, isExpired));
                        break;
                    case ALL:
                    default:
                        break;
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Gifticon> gifticons = gifticonRepository.findAll(spec, pageable);
        return gifticons.map(GifticonRoomResponseDto::from);
    }

    private RoomMember checkRoomAccess(Long userId, Long roomId) {
        return roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED));
    }
}
