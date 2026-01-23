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
import software.amazon.awssdk.services.s3.model.ObjectIdentifier;

import java.io.IOException;
import java.io.InputStream;
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

    @Value("${spring.cloud.aws.s3.bucket}")
    private String bucket;

    private final String TEMP_DIR = "temp/";

    @Override
    public String uploadTemp(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        String savedFileName = UUID.randomUUID() + "_" + originalFilename;
        String key = TEMP_DIR + savedFileName;

        try (InputStream is = file.getInputStream()) {
            s3Template.upload(bucket, key, is);
            // S3 URL 반환 (CloudFront 등을 쓴다면 그 도메인으로 교체 가능)
            return s3Template.download(bucket, key).getURL().toString();
        } catch (IOException e) {
            log.error("[S3] 업로드 실패", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public String copyToPermanent(String tempImageUrl, Long userId) {
        // 1. URL에서 파일명(key) 추출
        String fileName = tempImageUrl.substring(tempImageUrl.lastIndexOf("/") + 1);
        String sourceKey = TEMP_DIR + fileName;
        String destinationKey = userId + "/" + fileName;

        // 2. S3 내부 복사 (CopyObject)
        try {
            CopyObjectRequest copyReq = CopyObjectRequest.builder()
                    .sourceBucket(bucket)
                    .sourceKey(sourceKey)
                    .destinationBucket(bucket)
                    .destinationKey(destinationKey)
                    .build();

            s3Client.copyObject(copyReq);

            // 3. 복사된 파일의 URL 반환
            return s3Template.download(bucket, destinationKey).getURL().toString();

        } catch (Exception e) {
            log.error("[S3] 파일 이동(복사) 실패: {}", sourceKey, e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    // ★ S3 청소 로직
    @Override
    public void deleteOldTempFiles(int daysBefore) {
        // S3는 "생성일" 기준 조회나 필터링이 조금 까다롭지만, Lifecycle Rule을 쓰는 게 정석입니다.
        // 여기서는 코드로 구현하는 방법을 보여드립니다.

        // 1. temp/ 경로의 모든 객체 리스트 조회
        // (주의: 파일이 수만 개면 페이징 처리 필요. 여기선 단순화)
        s3Client.listObjectsV2Paginator(req -> req.bucket(bucket).prefix(TEMP_DIR))
                .stream()
                .flatMap(r -> r.contents().stream())
                .filter(obj -> {
                    // 2. 날짜 비교
                    Instant lastModified = obj.lastModified();
                    return lastModified.isBefore(Instant.now().minus(daysBefore, ChronoUnit.DAYS));
                })
                .forEach(obj -> {
                    // 3. 삭제
                    s3Template.deleteObject(bucket, obj.key());
                    log.info("[S3] 오래된 임시 파일 삭제: {}", obj.key());
                });
    }
}