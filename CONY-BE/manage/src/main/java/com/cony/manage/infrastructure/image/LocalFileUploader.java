package com.cony.manage.infrastructure.image;

import com.cony.manage.global.error.CustomException;
import com.cony.manage.global.error.ErrorCode;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.nio.file.attribute.BasicFileAttributes;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;
import java.util.stream.Stream;

@Slf4j
@Component
@Profile("local")
public class LocalFileUploader implements FileUploader {
    @Value("${file.dir}")
    private String rootPath;

    @Value("${file.domain}")
    private String domainUrl;

    @Override
    public String uploadTemp(MultipartFile file) {
        if(file == null || file.isEmpty()) {
            throw new CustomException(ErrorCode.INVALID_INPUT_VALUE);
        }

        try {
            String tempPath = rootPath + "/temp";
            File directory = new File(tempPath);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String originalFilename = file.getOriginalFilename();
            String savedFilename = UUID.randomUUID() + "_" + originalFilename;

            File dest = new File(tempPath + "/" + savedFilename);
            file.transferTo(dest);

            String encodedFileName = URLEncoder.encode(savedFilename, StandardCharsets.UTF_8)
                    .replace("+", "%20"); // 공백이 +로 바뀌는 것을 %20으로 보정 (선택 사항이지만 추천)

            return domainUrl + "/temp/" + encodedFileName;
        } catch(IOException e) {
            log.error("임시 파일 업로드 실패: ", e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public String copyToPermanent(String tempImageUrl, Long userId) {
        try {
            String filename = tempImageUrl.substring(tempImageUrl.lastIndexOf("/") + 1);
            filename = URLDecoder.decode(filename, StandardCharsets.UTF_8);

            Path sourcePath = Paths.get(rootPath + "/temp/" + filename);
            String userPathStr = rootPath + "/" + userId;
            Path targetDir = Paths.get(userPathStr);

            if (!Files.exists(sourcePath)) {
                throw new CustomException(ErrorCode.INVALID_INPUT_VALUE); // "파일이 만료되었거나 없습니다."
            }

            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            Path targetPath = targetDir.resolve(filename);
            if(Files.exists(targetPath)) {
                String nameWithoutExtension;
                String extension;
                int dotIndex = filename.lastIndexOf('.');

                if (dotIndex > 0) {
                    nameWithoutExtension = filename.substring(0, dotIndex);
                    extension = filename.substring(dotIndex); // .jpg 등
                } else {
                    nameWithoutExtension = filename;
                    extension = "";
                }

                // 중복되지 않는 파일명을 찾을 때까지 번호 증가 (예: file_1.jpg, file_2.jpg ...)
                int count = 1;
                while (Files.exists(targetPath)) {
                    String newFilename = nameWithoutExtension + "_" + count + extension;
                    targetPath = targetDir.resolve(newFilename);
                    filename = newFilename; // 반환할 URL을 위해 파일명 변수 업데이트
                    count++;
                }
            }

            Files.copy(sourcePath, targetPath);

            // 4. 변경된(혹은 기존) 파일명이 포함된 새로운 영구 URL 반환
            return domainUrl + "/" + userId + "/" + filename;

        } catch(IOException e) {
            log.error("파일 영구 이동 실패: {}", tempImageUrl, e);
            throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public void deleteOldTempFiles(int daysBefore) {
        String tempPath = rootPath + "/temp";
        File tempDir = new File(tempPath);
        if (!tempDir.exists()) return;

        Instant retentionTime = Instant.now().minus(daysBefore, ChronoUnit.DAYS);

        try (Stream<Path> files = Files.list(Paths.get(tempPath))) {
            files.forEach(path -> {
                try {
                    BasicFileAttributes attrs = Files.readAttributes(path, BasicFileAttributes.class);
                    if (attrs.lastModifiedTime().toInstant().isBefore(retentionTime)) {
                        Files.delete(path);
                        log.info("[Local] 오래된 임시 파일 삭제: {}", path.getFileName());
                    }
                } catch (IOException e) {
                    log.error("[Local] 파일 삭제 실패: {}", path, e);
                }
            });
        } catch (IOException e) {
            log.error("[Local] 임시 폴더 스캔 실패", e);
        }
    }
}
