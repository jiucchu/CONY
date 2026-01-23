package com.cony.manage.infrastructure.image;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploader {
    /**
     * 분석용 임시 파일 업로드
     * 저장 위치: uploads/temp/
     * @param file 분석할 이미지
     * @return 이미지의 임시 URL
     */
    String uploadTemp(MultipartFile file);

    /**
     * 최종 등록 시 영구 저장소로 이동
     * 이동 위치: uploads/temp/ => uploads/{userId}/
     * @param tempImageUrl 임시 저장소 URL
     * @param userId 기프티콘을 등록한 유저 아이디
     * @return 이동된 이미지의 최종 URL
     */
    String copyToPermanent(String tempImageUrl, Long userId);

    void deleteOldTempFiles(int daysBefore);
}
