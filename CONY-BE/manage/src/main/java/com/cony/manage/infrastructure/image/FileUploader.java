package com.cony.manage.infrastructure.image;

import org.springframework.web.multipart.MultipartFile;

public interface FileUploader {
    /**
     * 파일 업로드 (통합)
     * @param file 업로드할 파일
     * @param userId 유저 ID (null이면 'temp/' 경로에, 값이 있으면 '{userId}/' 경로에 저장)
     * @return 업로드된 파일의 URL
     */
    String upload(MultipartFile file, Long userId);

    /**
     * 최종 등록 시 영구 저장소로 이동
     * 이동 위치: uploads/temp/ => uploads/{userId}/
     * @param tempImageUrl 임시 저장소 URL
     * @param userId 기프티콘을 등록한 유저 아이디
     * @return 이동된 이미지의 최종 URL
     */
    String copyToPermanent(String tempImageUrl, Long userId);

    void deleteOldTempFiles(int daysBefore);

    /**
     * 이미지 접근 URL 생성
     * Local: 정적 리소스 URL 반환
     * S3: Presigned URL 반환
     * @param filePath 파일의 전체 경로 (예: "temp/uuid_file.jpg" 또는 "1/uuid_file.jpg")
     * @return 접근 가능한 URL
     */
    String getPresignedUrl(String filePath);
}
