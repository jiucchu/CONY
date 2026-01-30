package com.cony.manage.infrastructure.image;

import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import io.awspring.cloud.s3.S3Template;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CopyObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@Profile("prod") // ★ prod 프로필일 때만 빈으로 등록됨
@RequiredArgsConstructor
public class S3FileUploader implements FileUploader {

    private final S3Template s3Template;
    private final S3Client s3Client; // 상세 조작을 위해 Client도 사용
    private final S3Presigner s3Presigner;

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    private final String TEMP_DIR = "temp/";

    @Override
    public String upload(MultipartFile file, Long userId) {
        if(file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        String originalFilename = file.getOriginalFilename();
        String savedFileName = UUID.randomUUID() + "_" + originalFilename;

        // [분기 로직] userId가 null이면 temp/, 아니면 userId/
        String pathPrefix = (userId == null) ? TEMP_DIR : userId + "/";
        String key = pathPrefix + savedFileName;

        try (InputStream is = file.getInputStream()) {
            s3Template.upload(bucket, key, is);
            return key;
        } catch (IOException e) {
            log.error("[S3] 파일 업로드 실패", e);
            throw new CustomException(ErrorCode.FAIL_FILE_UPLOAD);
        }
    }

    @Override
    public String copyToPermanent(String tempKey, Long userId) {
        // 1. URL에서 파일명(key) 추출
        String fileName = tempKey.substring(tempKey.lastIndexOf("/") + 1);
        String destinationKey = userId + "/" + fileName;

        // 2. S3 내부 복사 (CopyObject)
        try {
            CopyObjectRequest copyReq = CopyObjectRequest.builder()
                    .sourceBucket(bucket)
                    .sourceKey(tempKey)
                    .destinationBucket(bucket)
                    .destinationKey(destinationKey)
                    .build();

            s3Client.copyObject(copyReq);

            // 3. 복사된 파일의 URL 반환
            return destinationKey;

        } catch (Exception e) {
            log.error("[S3] 파일 이동(복사) 실패: {}", tempKey, e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ★ S3 청소 로직
    @Override
    public void deleteOldTempFiles(int daysBefore) {
        Instant cutoffDate = Instant.now().minus(daysBefore, ChronoUnit.DAYS);
        log.info("[S3 Cleanup] 삭제 기준 시각: {}", cutoffDate);

        // 1. temp/ 경로의 모든 객체 리스트 조회
        // (주의: 파일이 수만 개면 페이징 처리 필요. 여기선 단순화)
        s3Client.listObjectsV2Paginator(req -> req.bucket(bucket).prefix(TEMP_DIR))
                .stream()
                .flatMap(r -> r.contents().stream())
                .forEach(obj -> {
                    // 2. 검사 로그 추가
                    Instant lastModified = obj.lastModified();
                    boolean toDelete = lastModified.isBefore(cutoffDate);

                    log.info("[S3 Check] 파일명: {}, 수정일: {}, 삭제대상여부: {}",
                            obj.key(), lastModified, toDelete);

                    // 3. 삭제 수행
                    if(toDelete) {
                        try {
                            s3Template.deleteObject(bucket, obj.key());
                            log.info(" -> [Deleted] 삭제 완료: {}", obj.key());
                        } catch (Exception e) {
                            log.error(" -> [Error] 삭제 실패: {}", obj.key(), e);
                        }
                    }
                });
    }

    @Override
    public String getPresignedUrl(String path) {
        if (path == null || path.isEmpty()) {
            return "";
        }

        try {
            // 1. 접근하려는 S3 객체 정의
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucket)
                    .key(path) // path는 "1/uuid_filename.jpg" 형태여야 함
                    .build();

            // 2. Presigned URL 요청 생성 (유효기간 10분 설정)
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(10)) // 필요에 따라 시간 조절
                    .getObjectRequest(getObjectRequest)
                    .build();

            // 3. URL 발급
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);

            log.info("[S3] Presigned URL 발급 완료: {}", path);
            return presignedRequest.url().toString();

        } catch (Exception e) {
            log.error("[S3] Presigned URL 발급 실패: path={}", path, e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }
}