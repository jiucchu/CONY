package com.cony.manage.domain.gifticon.entity;

import com.cony.manage.domain.gifticon.enums.ImageType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter @Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(name = "GIFTICON_IMAGE")
public class GifticonImage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id")
    private Long id;

    private String imageUrl;
    @Column(name = "s3_bucket")
    private String s3Bucket;
    @Column(name = "s3_key")
    private String s3Key;
    private String originalFilename;
    private Long fileSize;
    private String contentType;
    @Enumerated(EnumType.STRING)
    private ImageType imageType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "gifticon_id")
    private Gifticon gifticon;
}
