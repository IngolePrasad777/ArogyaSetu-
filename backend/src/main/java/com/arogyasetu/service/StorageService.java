package com.arogyasetu.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StorageService {
    private final S3Client s3Client;

    @Value("${app.aws.s3-bucket}")
    private String bucket;
    @Value("${app.aws.region}")
    private String region;

    public String uploadReport(UUID patientId, MultipartFile file) {
        try {
            String key = "reports/%s/%s-%s".formatted(patientId, UUID.randomUUID(), file.getOriginalFilename());
            s3Client.putObject(PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromBytes(file.getBytes()));
            return "https://%s.s3.%s.amazonaws.com/%s".formatted(bucket, region, key);
        } catch (IOException ex) {
            throw new IllegalStateException("Could not upload report", ex);
        }
    }
}
