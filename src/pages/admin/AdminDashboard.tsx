import { useMemo, useState, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Store,
  UtensilsCrossed,
  MessageSquare,
  Star,
  TrendingUp,
  Award,
} from "lucide-react";
import { getAllAccounts } from "@/utils/profileUtils";
import { getAllRestaurants } from "@/utils/restaurantUtils";
import { filterDeletedReviews } from "@/utils/reviewStorage";
import reviewsData from "@/data/reviews.json";
import menusDataDefault from "@/data/menus.json";

export default function Dashboard() {
  const { t } = useLanguage();
  const [menusData, setMenusData] = useState<any[]>([]);

  // Load dishes from localStorage or use default data
  useEffect(() => {
    const savedDishes = localStorage.getItem("dishes");
    if (savedDishes) {
      try {
        const parsed = JSON.parse(savedDishes);
        if (Array.isArray(parsed)) {
          setMenusData(parsed);
        } else {
          setMenusData(menusDataDefault);
        }
      } catch (error) {
        console.error("Error parsing dishes:", error);
        setMenusData(menusDataDefault);
      }
    } else {
      setMenusData(menusDataDefault);
    }
  }, []);

  // Tính toán thống kê
  const stats = useMemo(() => {
    // 1. Số lượng users
    const users = getAllAccounts();
    const totalUsers = users.length;
    const adminUsers = users.filter((u) => u.role === "admin").length;
    const customerUsers = totalUsers - adminUsers;

    // 2. Nhà hàng
    const restaurants = getAllRestaurants();
    const activeRestaurants = restaurants.filter(
      (r) => r.status === "active"
    ).length;

    // 3. Món ăn
    const totalDishes = menusData.length;

    // 4. Reviews (từ localStorage + filter deleted)
    const savedReviews = localStorage.getItem("reviews");
    let allReviews: any[] = [];

    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews);
        const jsonReviewsMap = new Map(reviewsData.map((r) => [r.id, r]));
        const savedReviewsMap = new Map(
          parsedReviews.map((r: any) => [r.id, r])
        );

        const mergedReviews = new Map();
        savedReviewsMap.forEach((review, id) => {
          mergedReviews.set(id, review);
        });
        jsonReviewsMap.forEach((review, id) => {
          if (!mergedReviews.has(id)) {
            mergedReviews.set(id, review);
          }
        });

        allReviews = Array.from(mergedReviews.values());
      } catch (error) {
        allReviews = reviewsData as any[];
      }
    } else {
      allReviews = reviewsData as any[];
    }

    // Filter deleted reviews
    allReviews = filterDeletedReviews(allReviews);

    const totalReviews = allReviews.length;
    const restaurantReviews = allReviews.filter((r) => r.type === "restaurant");
    const dishReviews = allReviews.filter((r) => r.type === "dish");

    // 5. Sao trung bình nhà hàng
    const avgRestaurantRating =
      restaurantReviews.length > 0
        ? (
            restaurantReviews.reduce((sum, r) => sum + r.rating, 0) /
            restaurantReviews.length
          ).toFixed(1)
        : "0.0";

    // 6. Sao trung bình món ăn
    const avgDishRating =
      dishReviews.length > 0
        ? (
            dishReviews.reduce((sum, r) => sum + r.rating, 0) /
            dishReviews.length
          ).toFixed(1)
        : "0.0";

    // 7. Review mới nhất (24h)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReviews = allReviews.filter(
      (r) => new Date(r.createdAt) > oneDayAgo
    ).length;

    // 8. Top rated restaurant
    const restaurantRatings = new Map<
      number,
      { total: number; count: number; name: string }
    >();
    restaurantReviews.forEach((review) => {
      const restaurant = restaurants.find((r) => r.id === review.targetId);
      if (restaurant) {
        const current = restaurantRatings.get(review.targetId) || {
          total: 0,
          count: 0,
          name: restaurant.name,
        };
        restaurantRatings.set(review.targetId, {
          total: current.total + review.rating,
          count: current.count + 1,
          name: restaurant.name,
        });
      }
    });

    let topRestaurant = { name: "N/A", rating: 0 };
    restaurantRatings.forEach((value) => {
      const avg = value.total / value.count;
      if (avg > topRestaurant.rating && value.count >= 3) {
        // Ít nhất 3 reviews
        topRestaurant = {
          name: value.name,
          rating: parseFloat(avg.toFixed(1)),
        };
      }
    });

    return {
      totalUsers,
      customerUsers,
      adminUsers,
      totalRestaurants: restaurants.length,
      activeRestaurants,
      totalDishes,
      totalReviews,
      restaurantReviewsCount: restaurantReviews.length,
      dishReviewsCount: dishReviews.length,
      avgRestaurantRating,
      avgDishRating,
      recentReviews,
      topRestaurant,
    };
  }, [menusData]);

  const statCards = [
    {
      title: t("admin.totalUsers"),
      value: stats.totalUsers,
      subtitle: `${stats.customerUsers} ${t("admin.customersAndAdmins", {
        admins: stats.adminUsers,
      })}`,
      icon: Users,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      title: t("admin.restaurants"),
      value: stats.totalRestaurants,
      subtitle: `${stats.activeRestaurants} ${t("admin.activeRestaurants")}`,
      icon: Store,
      color: "bg-green-500",
      gradient: "from-green-500 to-green-600",
    },
    {
      title: t("admin.dishes"),
      value: stats.totalDishes,
      subtitle: t("admin.totalDishesInSystem"),
      icon: UtensilsCrossed,
      color: "bg-orange-500",
      gradient: "from-orange-500 to-orange-600",
    },
    {
      title: t("admin.reviews"),
      value: stats.totalReviews,
      subtitle: `${stats.recentReviews} ${t("admin.newReviews24h")}`,
      icon: MessageSquare,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      title: t("admin.avgRestaurantRating"),
      value: stats.avgRestaurantRating,
      subtitle: `${stats.restaurantReviewsCount} ${t("admin.reviewsCount")}`,
      icon: Star,
      color: "bg-yellow-500",
      gradient: "from-yellow-500 to-yellow-600",
    },
    {
      title: t("admin.avgDishRating"),
      value: stats.avgDishRating,
      subtitle: `${stats.dishReviewsCount} ${t("admin.reviewsCount")}`,
      icon: Award,
      color: "bg-pink-500",
      gradient: "from-pink-500 to-pink-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t("admin.dashboardTitle")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("admin.dashboardSubtitle")}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div
                  className={`p-2 rounded-lg bg-gradient-to-br ${card.gradient}`}
                >
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Top Restaurant */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              {t("admin.topRatedRestaurant")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">{stats.topRestaurant.name}</p>
                <p className="text-sm text-muted-foreground">
                  {t("admin.basedOnRecentReviews")}
                </p>
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-6 w-6 fill-current" />
                <span className="text-2xl font-bold">
                  {stats.topRestaurant.rating}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" />
              {t("admin.reviewAnalysis")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t("admin.restaurantReviews")}
                </span>
                <span className="font-bold">
                  {stats.restaurantReviewsCount}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t("admin.dishReviews")}
                </span>
                <span className="font-bold">{stats.dishReviewsCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {t("admin.newIn24h")}
                </span>
                <span className="font-bold text-green-600">
                  {stats.recentReviews}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
