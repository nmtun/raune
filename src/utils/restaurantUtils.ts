import restaurantsData from '@/data/restaurants.json';
import reviewsData from '@/data/reviews.json';

const STORAGE_KEY_RESTAURANTS = 'restaurants';
const STORAGE_KEY_RESTAURANTS_INITIALIZED = 'restaurantsInitialized';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  reviews: number;
  tags: string[];
  photo: string;
}

interface Review {
  id: number;
  userId: number;
  type: 'restaurant' | 'dish';
  targetId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
}

/**
 * Khởi tạo restaurants từ restaurants.json vào localStorage (chỉ chạy 1 lần)
 */
export const initializeRestaurants = () => {
  try {
    // Kiểm tra xem đã khởi tạo chưa
    const isInitialized = localStorage.getItem(STORAGE_KEY_RESTAURANTS_INITIALIZED);
    if (isInitialized === 'true') {
      return; // Đã khởi tạo rồi, không làm gì
    }

    // Copy restaurants từ JSON vào localStorage
    localStorage.setItem(STORAGE_KEY_RESTAURANTS, JSON.stringify(restaurantsData));
    localStorage.setItem(STORAGE_KEY_RESTAURANTS_INITIALIZED, 'true');
    console.log('Restaurants initialized from restaurants.json to localStorage');
  } catch (error) {
    console.error('Error initializing restaurants:', error);
  }
};

/**
 * Lấy tất cả restaurants từ localStorage
 */
export const getAllRestaurants = (): Restaurant[] => {
  try {
    // Đảm bảo đã khởi tạo
    initializeRestaurants();
    
    // Get restaurants from localStorage only
    const localRestaurantsStr = localStorage.getItem(STORAGE_KEY_RESTAURANTS);
    const localRestaurants = localRestaurantsStr ? JSON.parse(localRestaurantsStr) : [];
    
    return localRestaurants;
  } catch (error) {
    console.error('Error getting all restaurants:', error);
    return [];
  }
};

/**
 * Lấy reviews từ localStorage hoặc JSON
 */
const getAllReviews = (): Review[] => {
  try {
    const savedReviews = localStorage.getItem('reviews');
    if (savedReviews) {
      const parsedReviews = JSON.parse(savedReviews);
      // Merge với dữ liệu từ JSON để đảm bảo có đầy đủ reviews
      const jsonReviewsMap = new Map((reviewsData as Review[]).map(r => [r.id, r]));
      const savedReviewsMap = new Map(parsedReviews.map((r: Review) => [r.id, r]));
      
      const mergedReviews = new Map();
      
      // Thêm tất cả reviews từ localStorage (đã được edit)
      savedReviewsMap.forEach((review, id) => {
        mergedReviews.set(id, review);
      });
      
      // Thêm reviews từ JSON nếu chưa có trong localStorage
      jsonReviewsMap.forEach((review, id) => {
        if (!mergedReviews.has(id)) {
          mergedReviews.set(id, review);
        }
      });
      
      return Array.from(mergedReviews.values());
    } else {
      return reviewsData as Review[];
    }
  } catch (error) {
    console.error('Error getting reviews:', error);
    return reviewsData as Review[];
  }
};

/**
 * Tính rating và số lượng reviews thực tế cho một nhà hàng
 */
export const calculateRestaurantStats = (restaurantId: number): { rating: number; reviews: number } => {
  const allReviews = getAllReviews();
  
  // Lọc reviews cho nhà hàng này (chỉ restaurant reviews, không tính dish reviews)
  const restaurantReviews = allReviews.filter(
    (r) => r.type === 'restaurant' && r.targetId === restaurantId
  );
  
  if (restaurantReviews.length === 0) {
    return { rating: 0, reviews: 0 };
  }
  
  // Tính rating trung bình
  const totalRating = restaurantReviews.reduce((sum, r) => sum + r.rating, 0);
  const averageRating = totalRating / restaurantReviews.length;
  
  return {
    rating: Math.round(averageRating * 10) / 10, // Làm tròn 1 chữ số thập phân
    reviews: restaurantReviews.length,
  };
};

/**
 * Lấy restaurant theo ID với rating và reviews được tính thực tế
 */
export const getRestaurantById = (id: number): Restaurant | null => {
  const allRestaurants = getAllRestaurants();
  const restaurant = allRestaurants.find((r) => r.id === id);
  
  if (!restaurant) {
    return null;
  }
  
  // Tính rating và reviews thực tế
  const stats = calculateRestaurantStats(id);
  
  return {
    ...restaurant,
    rating: stats.rating,
    reviews: stats.reviews,
  };
};

