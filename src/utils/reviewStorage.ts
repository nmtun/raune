// Quản lý localStorage cho reviews đã xóa

import reviewsData from '@/data/reviews.json';

const DELETED_REVIEWS_KEY = 'deletedReviewIds';
const DELETED_REVIEWS_INITIALIZED_KEY = 'deletedReviewsInitialized';

/**
 * Khởi tạo deleted reviews từ JSON (chạy 1 lần đầu tiên)
 * Đọc tất cả reviews có isDeleted: true trong JSON và copy vào localStorage
 */
export function initializeDeletedReviews(): void {
  try {
    // Kiểm tra đã init chưa
    const isInitialized = localStorage.getItem(DELETED_REVIEWS_INITIALIZED_KEY);
    if (isInitialized === 'true') {
      return; // Đã init rồi, không làm gì
    }

    // Tìm tất cả reviews có isDeleted: true trong JSON
    const preDeletedReviews = (reviewsData as any[]).filter(
      (review) => review.isDeleted === true
    );

    // Lấy danh sách IDs
    const preDeletedIds = preDeletedReviews.map((review) => review.id);

    // Lưu vào localStorage
    if (preDeletedIds.length > 0) {
      localStorage.setItem(DELETED_REVIEWS_KEY, JSON.stringify(preDeletedIds));
      console.log(`Initialized ${preDeletedIds.length} pre-deleted reviews from JSON`);
    }

    // Đánh dấu đã init
    localStorage.setItem(DELETED_REVIEWS_INITIALIZED_KEY, 'true');
  } catch (error) {
    console.error('Error initializing deleted reviews:', error);
  }
}

/**
 * Lấy danh sách ID reviews đã xóa từ localStorage
 */
export function getDeletedReviewIds(): Set<number> {
  // Đảm bảo đã init
  initializeDeletedReviews();
  
  try {
    const stored = localStorage.getItem(DELETED_REVIEWS_KEY);
    if (stored) {
      const ids = JSON.parse(stored);
      return new Set(ids);
    }
  } catch (error) {
    console.error('Error reading deleted review IDs:', error);
  }
  return new Set();
}

/**
 * Thêm một review ID vào danh sách đã xóa
 */
export function addDeletedReviewId(reviewId: number): void {
  const deletedIds = getDeletedReviewIds();
  deletedIds.add(reviewId);
  localStorage.setItem(DELETED_REVIEWS_KEY, JSON.stringify(Array.from(deletedIds)));
}

/**
 * Xóa một review ID khỏi danh sách đã xóa (restore)
 */
export function removeDeletedReviewId(reviewId: number): void {
  const deletedIds = getDeletedReviewIds();
  deletedIds.delete(reviewId);
  localStorage.setItem(DELETED_REVIEWS_KEY, JSON.stringify(Array.from(deletedIds)));
}

/**
 * Kiểm tra xem một review đã bị xóa chưa
 */
export function isReviewDeleted(reviewId: number): boolean {
  const deletedIds = getDeletedReviewIds();
  return deletedIds.has(reviewId);
}

/**
 * Filter reviews để loại bỏ những cái đã xóa
 */
export function filterDeletedReviews<T extends { id: number }>(reviews: T[]): T[] {
  const deletedIds = getDeletedReviewIds();
  return reviews.filter(review => !deletedIds.has(review.id));
}

/**
 * Clear tất cả deleted review IDs (dùng cho testing)
 */
export function clearDeletedReviews(): void {
  localStorage.removeItem(DELETED_REVIEWS_KEY);
}
