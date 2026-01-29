package com.cony.manage.domain.room.service;

import com.cony.manage.domain.gifticon.entity.Gifticon;
import com.cony.manage.domain.gifticon.repository.GifticonRepository;
import com.cony.manage.domain.room.dto.request.RoomCreateRequestDto;
import com.cony.manage.domain.room.dto.response.GifticonRoomResponseDto;
import com.cony.manage.domain.room.dto.response.RoomResponseDto;
import com.cony.manage.domain.room.entity.Room;
import com.cony.manage.domain.room.entity.RoomMember;
import com.cony.manage.domain.room.enums.RoomRole;
import com.cony.manage.domain.room.enums.RoomType;
import com.cony.manage.domain.room.repository.RoomMemberRepository;
import com.cony.manage.domain.room.repository.RoomRepository;
import com.cony.manage.domain.user.entity.User;
import com.cony.manage.domain.user.repository.UserRepository;
import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public List<RoomResponseDto> getMyRooms(Long userId) {
        List<RoomMember> members = roomMemberRepository.findAllByUserId(userId);

        // Sorting: DEFAULT first, then SHARED by logic (here created at desc for
        // simplicity or as defined)
        return members.stream()
                .sorted(Comparator.comparing((RoomMember rm) -> rm.getRoom().getType() == RoomType.DEFAULT ? 0 : 1)
                        .thenComparing(rm -> rm.getRoom().getCreatedAt(), Comparator.reverseOrder())) // Latest shared
                                                                                                      // rooms first
                .map(rm -> {
                    Room room = rm.getRoom();
                    // Hardcoded count for now or need separate query.
                    // PRD says "memberCount". This might cause N+1.
                    // For MVP optimization, assume checking local implementation later.
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
                .type(RoomType.SHARED)
                .owner(user)
                .inviteCode(UUID.randomUUID().toString().substring(0, 8))
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
            com.cony.manage.domain.room.enums.GifticonSearchStatus status,
            String keyword,
            Pageable pageable) {
        checkRoomAccess(userId, roomId);

        org.springframework.data.jpa.domain.Specification<Gifticon> spec = (root, query, cb) -> {
            java.util.List<jakarta.persistence.criteria.Predicate> predicates = new java.util.ArrayList<>();

            // 1. Room ID
            predicates.add(cb.equal(root.get("room").get("id"), roomId));

            // 2. Keyword
            if (keyword != null && !keyword.isBlank()) {
                String likePattern = "%" + keyword + "%";
                predicates.add(cb.or(
                        cb.like(root.get("brandName"), likePattern),
                        cb.like(root.get("productName"), likePattern)));
            }

            // 3. Status
            if (status != null) {
                switch (status) {
                    case AVAILABLE:
                        // status IN (NOT_USED, IN_USE)
                        predicates.add(root.get("status").in(
                                com.cony.manage.domain.gifticon.enums.GifticonStatus.NOT_USED,
                                com.cony.manage.domain.gifticon.enums.GifticonStatus.IN_USE));
                        // AND expiryDate >= now() is usually implied by NOT_USED/IN_USE logic but PRD
                        // says "expiryDate < now" implies USED.
                        // So AVAILABLE means not expired.
                        // But if status is NOT_USED, it could be expired?
                        // PRD: "USED: status = 'USED' OR expiryDate < now()"
                        // So AVAILABLE must trigger if NOT(USED or Expired).
                        // i.e., status != USED AND expiryDate >= now
                        predicates.add(cb.greaterThanOrEqualTo(root.get("expiryDate"), java.time.LocalDate.now()));
                        break;
                    case USED:
                        // status = USED OR expiryDate < now()
                        jakarta.persistence.criteria.Predicate isUsed = cb.equal(root.get("status"),
                                com.cony.manage.domain.gifticon.enums.GifticonStatus.USED);
                        jakarta.persistence.criteria.Predicate isExpired = cb.lessThan(root.get("expiryDate"),
                                java.time.LocalDate.now());
                        predicates.add(cb.or(isUsed, isExpired));
                        break;
                    case ALL:
                    default:
                        break;
                }
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Gifticon> gifticons = gifticonRepository.findAll(spec, pageable);
        return gifticons.map(GifticonRoomResponseDto::from);
    }

    private RoomMember checkRoomAccess(Long userId, Long roomId) {
        return roomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(() -> new CustomException(ErrorCode.ACCESS_DENIED));
    }
}
