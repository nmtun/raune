import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import {
  Star,
  Filter,
  Calendar,
  User,
  MessageSquare,
  MapPin,
  Utensils,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

// --- 1. IMPORT DỮ LIỆU TỪ FILE JSON ---
// Hãy sửa lại đường dẫn nếu file của bạn tên khác
import reviewsData from "@/data/reviews.json";
import accountsData from "@/data/accounts.json";
// Nếu chưa có 2 file dưới, bạn có thể comment lại và dùng hàm giả tạm thời
import restaurantsData from "@/data/restaurants.json";
import dishesData from "@/data/menus.json";

export default function ManageReviews() {
  const [sortOption, setSortOption] = useState<string>("newest");
  const { t, language } = useLanguage();
  const { getLocalizedContent } = useLanguage();

  // --- 2. HÀM TRA CỨU (LOOKUP HELPER) ---

  // Hàm lấy thông tin User từ ID
  const getUserInfo = (userId: number) => {
    const user = accountsData.find((acc) => acc.id === userId);
    return {
      name: user ? user.username : `User #${userId}`,
      avatar: user ? user.profileImage : null,
    };
  };

  // Hàm lấy tên Mục tiêu (Nhà hàng hoặc Món ăn) từ ID
  const getTargetName = (type: string, targetId: number) => {
    if (type === "restaurant") {
      const restaurant = restaurantsData.find((r) => r.id === targetId);
      return restaurant ? restaurant.name : `Nhà hàng #${targetId}`;
    } else if (type === "dish") {
      const dish = dishesData.find((d) => d.id === targetId);
      return dish ? dish.name : `Món ăn #${targetId}`;
    }
    return "Không xác định";
  };

  // --- 3. LOGIC SẮP XẾP (GIỮ NGUYÊN) ---
  const sortedReviews = useMemo(() => {
    const sorted = [...reviewsData]; // Copy từ file import

    switch (sortOption) {
      case "newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case "rating-high":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "rating-low":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [sortOption]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.reviewManagement")}
          </h1>
          <p className="text-muted-foreground">
            {t("admin.sum")}:{" "}
            <span className="font-bold text-primary">{reviewsData.length}</span>{" "}
            {t("admin.review")}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border shadow-sm">
          <Filter className="w-4 h-4 ml-2 text-muted-foreground" />
          <select
            className="p-2 text-sm bg-transparent border-none outline-none cursor-pointer min-w-[180px]"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="newest">Ngày: Mới nhất trước</option>
            <option value="oldest">Ngày: Cũ nhất trước</option>
            <option value="rating-high">Đánh giá: Cao đến Thấp</option>
            <option value="rating-low">Đánh giá: Thấp đến Cao</option>
          </select>
        </div>
      </div>

      {/* Grid Reviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedReviews.map((review) => {
          // Lấy thông tin chi tiết cho từng review
          const userInfo = getUserInfo(review.userId);
          const targetName = getTargetName(review.type, review.targetId);

          return (
            <Card
              key={review.id}
              className="flex flex-col hover:shadow-md transition-shadow border-t-4 border-t-transparent hover:border-t-primary"
            >
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  {/* User Info lấy từ accounts.json */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden">
                      {userInfo.avatar ? (
                        <img
                          src={userInfo.avatar}
                          alt={userInfo.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold">
                        {userInfo.name}
                      </CardTitle>
                      <div className="flex items-center text-xs text-muted-foreground mt-0.5 gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(review.createdAt).toLocaleDateString(
                          language === "ja" ? "ja-JP" : "vi-VN"
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rating Badge */}
                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded text-yellow-700 font-bold text-xs border border-yellow-100">
                    {review.rating}{" "}
                    <Star className="w-3 h-3 ml-1 fill-yellow-700" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                {/* Nội dung đánh giá */}
                <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-700 relative min-h-[60px]">
                  <MessageSquare className="w-4 h-4 absolute top-3 left-3 text-slate-300" />
                  <p className="pl-6 italic line-clamp-3">"{review.comment}"</p>
                </div>

                {/* Thông tin đối tượng được review (Nhà hàng/Món) */}
                <div className="pt-2 border-t border-dashed">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {review.type === "restaurant" ? (
                        <MapPin className="w-3 h-3" />
                      ) : (
                        <Utensils className="w-3 h-3" />
                      )}
                      <span className="capitalize">
                        {review.type === "restaurant"
                          ? t("admin.restaurant")
                          : t("admin.dish")}
                      </span>
                    </div>

                    {/* Tên đối tượng lấy từ restaurants.json / menus.json */}
                    <span
                      className="font-semibold text-foreground truncate max-w-[150px]"
                      title={getLocalizedContent(targetName)}
                    >
                      {getLocalizedContent(targetName)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
