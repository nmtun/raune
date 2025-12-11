const fs = require('fs');
const path = require('path');

// Đọc dữ liệu
const reviewsPath = path.join(__dirname, 'src/data/reviews.json');
const restaurantsPath = path.join(__dirname, 'src/data/restaurants.json');
const menusPath = path.join(__dirname, 'src/data/menus.json');

const existingReviews = JSON.parse(fs.readFileSync(reviewsPath, 'utf8'));
const restaurants = JSON.parse(fs.readFileSync(restaurantsPath, 'utf8'));
const menus = JSON.parse(fs.readFileSync(menusPath, 'utf8'));

// Phân tích reviews hiện tại
const restaurantReviewCounts = {};
const dishReviewCounts = {};

existingReviews.forEach(r => {
  if (r.type === 'restaurant') {
    restaurantReviewCounts[r.targetId] = (restaurantReviewCounts[r.targetId] || 0) + 1;
  } else if (r.type === 'dish') {
    const dish = menus.find(m => m.id === r.targetId);
    if (dish) {
      dishReviewCounts[dish.restaurantId] = (dishReviewCounts[dish.restaurantId] || 0) + 1;
    }
  }
});

// Tìm max ID
let maxId = Math.max(...existingReviews.map(r => r.id), 0);

// Comments mẫu cho restaurant reviews
const restaurantComments = {
  Vietnamese: [
    "Món ăn Việt Nam đậm đà, hương vị truyền thống.",
    "Không gian ấm cúng, phục vụ nhiệt tình.",
    "Giá cả hợp lý, chất lượng tốt.",
    "Món ăn tươi ngon, đúng vị Hà Nội.",
    "Nhà hàng sạch sẽ, nhân viên thân thiện."
  ],
  Cafe: [
    "Cà phê thơm ngon, không gian yên tĩnh.",
    "Đồ uống đa dạng, giá cả phải chăng.",
    "View đẹp, thích hợp làm việc.",
    "Bánh ngọt tươi, cà phê đậm đà.",
    "Không gian hiện đại, wifi ổn định."
  ],
  FastFood: [
    "Phục vụ nhanh, món ăn nóng hổi.",
    "Giá cả hợp lý, phù hợp gia đình.",
    "Menu đa dạng, chất lượng ổn định.",
    "Không gian rộng rãi, sạch sẽ.",
    "Đồ ăn giòn ngon, đúng vị."
  ],
  Asian: [
    "Món ăn châu Á đậm đà, hương vị đặc trưng.",
    "Không gian sang trọng, phục vụ chuyên nghiệp.",
    "Món ăn tươi ngon, trình bày đẹp mắt.",
    "Giá cả hợp lý, chất lượng cao.",
    "Nhà hàng đông khách, phục vụ nhanh."
  ],
  Western: [
    "Món Tây đúng chuẩn, hương vị tuyệt vời.",
    "Không gian lãng mạn, phù hợp hẹn hò.",
    "Món ăn sáng tạo, trình bày đẹp.",
    "Nhân viên chuyên nghiệp, phục vụ chu đáo.",
    "Giá cả hợp lý, chất lượng tốt."
  ]
};

// Comments mẫu cho dish reviews
const dishComments = {
  Vietnamese: [
    "Món ăn đậm đà, đúng vị truyền thống.",
    "Nguyên liệu tươi ngon, nấu vừa miệng.",
    "Hương vị hấp dẫn, sẽ quay lại.",
    "Món ăn ngon, giá cả hợp lý.",
    "Trình bày đẹp, hương vị tuyệt vời."
  ],
  Cafe: [
    "Đồ uống thơm ngon, đậm đà.",
    "Bánh ngọt tươi, vị ngon.",
    "Cà phê đúng chuẩn, giá hợp lý.",
    "Đồ uống mát lạnh, hấp dẫn.",
    "Hương vị đặc biệt, đáng thử."
  ],
  FastFood: [
    "Món ăn giòn ngon, nóng hổi.",
    "Đồ ăn đúng vị, giá hợp lý.",
    "Món ăn ngon, phục vụ nhanh.",
    "Hương vị hấp dẫn, sẽ quay lại.",
    "Chất lượng tốt, giá cả phải chăng."
  ],
  Asian: [
    "Món ăn đậm đà, hương vị đặc trưng.",
    "Nguyên liệu tươi, nấu vừa miệng.",
    "Trình bày đẹp, hương vị tuyệt vời.",
    "Món ăn ngon, đúng chuẩn.",
    "Hương vị hấp dẫn, chất lượng cao."
  ],
  Western: [
    "Món ăn đúng chuẩn, hương vị tuyệt vời.",
    "Trình bày đẹp, hương vị đặc biệt.",
    "Món ăn ngon, giá cả hợp lý.",
    "Hương vị hấp dẫn, chất lượng tốt.",
    "Món ăn sáng tạo, đáng thử."
  ]
};

// Tạo review mới
const newReviews = [];

// Tạo reviews cho tất cả nhà hàng (1-65)
for (let restaurantId = 1; restaurantId <= 65; restaurantId++) {
  const restaurant = restaurants.find(r => r.id === restaurantId);
  if (!restaurant) continue;

  const category = restaurant.category;
  const currentRestaurantReviews = restaurantReviewCounts[restaurantId] || 0;
  const currentDishReviews = dishReviewCounts[restaurantId] || 0;

  // Tạo restaurant reviews (cần ít nhất 3)
  const neededRestaurantReviews = Math.max(0, 3 - currentRestaurantReviews);
  for (let i = 0; i < neededRestaurantReviews; i++) {
    maxId++;
    const userId = (i % 4) + 1; // Rotate between users 1-4
    const rating = [4, 5, 4, 5, 3][i % 5]; // Mix of ratings
    const commentIndex = (restaurantId + i) % restaurantComments[category].length;
    const comment = restaurantComments[category][commentIndex];
    
    // Tạo ngày tháng ngẫu nhiên trong 6 tháng qua
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    const hours = Math.floor(Math.random() * 12) + 8; // 8-20h
    const minutes = Math.floor(Math.random() * 60);
    date.setHours(hours, minutes, 0, 0);

    newReviews.push({
      id: maxId,
      userId: userId,
      type: "restaurant",
      targetId: restaurantId,
      rating: rating,
      comment: comment,
      createdAt: date.toISOString(),
      updatedAt: null,
      isEdited: false
    });
  }

  // Tạo dish reviews (cần ít nhất 3)
  const restaurantDishes = menus.filter(m => m.restaurantId === restaurantId);
  if (restaurantDishes.length > 0) {
    const neededDishReviews = Math.max(0, 3 - currentDishReviews);
    for (let i = 0; i < neededDishReviews; i++) {
      const dish = restaurantDishes[i % restaurantDishes.length];
      if (!dish) continue;

      maxId++;
      const userId = (i % 4) + 1;
      const rating = [4, 5, 4, 5, 3][i % 5];
      const commentIndex = (restaurantId + i) % dishComments[category].length;
      const comment = dishComments[category][commentIndex];
      
      const daysAgo = Math.floor(Math.random() * 180);
      const date = new Date();
      date.setDate(date.getDate() - daysAgo);
      const hours = Math.floor(Math.random() * 12) + 8;
      const minutes = Math.floor(Math.random() * 60);
      date.setHours(hours, minutes, 0, 0);

      newReviews.push({
        id: maxId,
        userId: userId,
        type: "dish",
        targetId: dish.id,
        rating: rating,
        comment: comment,
        createdAt: date.toISOString(),
        updatedAt: null,
        isEdited: false
      });
    }
  }
}

// Kết hợp reviews cũ và mới, sắp xếp theo ID
const allReviews = [...existingReviews, ...newReviews].sort((a, b) => a.id - b.id);

// Ghi file
fs.writeFileSync(reviewsPath, JSON.stringify(allReviews, null, 2), 'utf8');

console.log(`Đã thêm ${newReviews.length} reviews mới.`);
console.log(`Tổng số reviews: ${allReviews.length}`);

// Kiểm tra lại
const finalRestaurantCounts = {};
const finalDishCounts = {};

allReviews.forEach(r => {
  if (r.type === 'restaurant') {
    finalRestaurantCounts[r.targetId] = (finalRestaurantCounts[r.targetId] || 0) + 1;
  } else if (r.type === 'dish') {
    const dish = menus.find(m => m.id === r.targetId);
    if (dish) {
      finalDishCounts[dish.restaurantId] = (finalDishCounts[dish.restaurantId] || 0) + 1;
    }
  }
});

// Kiểm tra xem tất cả nhà hàng có đủ reviews không
let allGood = true;
for (let i = 1; i <= 65; i++) {
  const restaurant = restaurants.find(r => r.id === i);
  if (!restaurant) continue;
  
  const restaurantCount = finalRestaurantCounts[i] || 0;
  const dishCount = finalDishCounts[i] || 0;
  
  if (restaurantCount < 3 || dishCount < 3) {
    console.log(`Nhà hàng ${i} (${restaurant.name}): Restaurant: ${restaurantCount}/3, Dish: ${dishCount}/3`);
    allGood = false;
  }
}

if (allGood) {
  console.log('✓ Tất cả nhà hàng đều có đủ reviews!');
}

