/**
 * 이미지 URL 유틸리티
 * 백엔드에서 썸네일과 원본을 모두 받아서 썸네일을 우선 표시하도록 처리
 */

/**
 * 썸네일 URL을 우선적으로 반환하는 헬퍼 함수
 * 썸네일이 있으면 썸네일을, 없으면 원본을 반환
 */
export const getThumbnailUrl = (
  thumbnailUrl?: string | null,
  originalUrl?: string | null
): string | null => {
  if (thumbnailUrl && thumbnailUrl.trim() !== '') {
    return thumbnailUrl;
  }
  if (originalUrl && originalUrl.trim() !== '') {
    return originalUrl;
  }
  return null;
};

/**
 * 기프티콘 이미지 URL 가져오기
 * 백엔드 API 응답에서 썸네일과 원본을 모두 받을 수 있도록 확장 가능
 */
export const getGifticonImageUrl = (
  imageUrl?: string | null,
  thumbnailUrl?: string | null
): string | null => {
  return getThumbnailUrl(thumbnailUrl, imageUrl);
};
