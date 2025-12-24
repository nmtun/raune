import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/button";
import {
  Star,
  Search,
  Trash2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown, // Icon mặc định
  ArrowUp, // Icon tăng dần
  ArrowDown, // Icon giảm dần
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import reviewsData from "@/data/reviews.json";
import accountsData from "@/data/accounts.json";
import restaurantsData from "@/data/restaurants.json";
import dishesData from "@/data/menus.json";
import { addDeletedReviewId, getDeletedReviewIds } from "@/utils/reviewStorage";

const ITEMS_PER_PAGE = 10;

export default function ManageReviews() {
  const { t, language, getLocalizedContent } = useLanguage();

  // 1. STATE DỮ LIỆU
  const [localReviews, setLocalReviews] = useState(() => {
    // Load reviews từ localStorage (nơi user lưu reviews mới) hoặc JSON
    const savedReviews = localStorage.getItem("reviews");
    let allReviews: any[] = [];

    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews);
        // Merge với dữ liệu từ JSON để đảm bảo có đầy đủ reviews
        const jsonReviewsMap = new Map(reviewsData.map((r) => [r.id, r]));
        const savedReviewsMap = new Map(
          parsedReviews.map((r: any) => [r.id, r])
        );

        const mergedReviews = new Map();

        // Thêm tất cả reviews từ localStorage (bao gồm reviews mới)
        savedReviewsMap.forEach((review, id) => {
          mergedReviews.set(id, review);
        });

        // Thêm reviews từ JSON nếu chưa có trong localStorage
        jsonReviewsMap.forEach((review, id) => {
          if (!mergedReviews.has(id)) {
            mergedReviews.set(id, review);
          }
        });

        allReviews = Array.from(mergedReviews.values());
      } catch (error) {
        console.error("Error parsing saved reviews:", error);
        allReviews = reviewsData;
      }
    } else {
      allReviews = reviewsData;
    }

    // Mark reviews đã xóa từ CẢ 2 NGUỒN:
    // 1. Reviews có isDeleted: true trong data
    // 2. Reviews đã xóa lưu trong localStorage
    const deletedIds = getDeletedReviewIds();
    return allReviews.map((review) => ({
      ...review,
      isDeleted: review.isDeleted === true || deletedIds.has(review.id),
    }));
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // 2. STATE PHÂN TRANG
  const [currentPage, setCurrentPage] = useState(1);

  // --- 3. STATE SẮP XẾP (MỚI) ---
  // Mặc định sắp xếp theo thời gian giảm dần
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({ key: "createdAt", direction: "desc" });

  // --- Helper Functions ---
  const getUserInfo = (userId: number) => {
    const user = accountsData.find((acc) => acc.id === userId);
    return {
      name: user ? user.username : `User #${userId}`,
      avatar: user ? user.profileImage : null,
    };
  };

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      language === "ja" ? "ja-JP" : "vi-VN",
      {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // --- HÀM XỬ LÝ CLICK HEADER (MỚI) ---
  const handleSort = (key: string) => {
    setSortConfig((current) => {
      // Nếu click lại vào cột đang sort -> Đảo chiều
      if (current.key === key) {
        return { key, direction: current.direction === "asc" ? "desc" : "asc" };
      }
      // Nếu click vào cột mới -> Mặc định giảm dần (desc)
      return { key, direction: "desc" };
    });
  };

  // --- COMPONENT ICON SORT (MỚI) ---
  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortConfig.key !== columnKey)
      return <ArrowUpDown className="w-3 h-3 ml-1 text-slate-300" />;
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="w-3 h-3 ml-1 text-primary" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1 text-primary" />
    );
  };

  // --- LOGIC LỌC & SẮP XẾP ---
  const filteredData = useMemo(() => {
    let data = [...localReviews];

    // 1. Lọc
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter((review) => {
        const userName = getUserInfo(review.userId).name.toLowerCase();
        const targetName = getLocalizedContent(
          getTargetName(review.type, review.targetId)
        ).toLowerCase();
        return userName.includes(lowerTerm) || targetName.includes(lowerTerm);
      });
    }

    if (ratingFilter !== "all") {
      data = data.filter((r) => r.rating === parseInt(ratingFilter));
    }

    // 2. Sắp xếp (Updated Logic)
    return data.sort((a, b) => {
      const { key, direction } = sortConfig;
      const multiplier = direction === "asc" ? 1 : -1;

      if (key === "createdAt") {
        return (
          (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
          multiplier
        );
      }
      if (key === "id") {
        return (a.id - b.id) * multiplier;
      }
      if (key === "rating") {
        return (a.rating - b.rating) * multiplier;
      }
      return 0;
    });
  }, [localReviews, searchTerm, ratingFilter, language, sortConfig]); // Thêm sortConfig vào dependencies

  // --- TÍNH TOÁN PHÂN TRANG ---
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, ratingFilter, sortConfig]); // Reset trang khi sort thay đổi

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedData = filteredData.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // --- XỬ LÝ XÓA ---
  const handleConfirmDelete = () => {
    if (deleteId !== null) {
      // Lưu ID vào localStorage
      addDeletedReviewId(deleteId);

      // Cập nhật state
      setLocalReviews((prev) =>
        prev.map((item) =>
          item.id === deleteId ? { ...item, isDeleted: true } : item
        )
      );
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter (Giữ nguyên) */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">
            {t("admin.reviewManagement")}
          </h1>
          <Badge variant="outline" className="text-base px-3 py-1">
            {t("admin.reviewTotal")}: {filteredData.length}
          </Badge>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t("admin.reviewSearchPlaceholder")}
              className="w-full pl-9 pr-4 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="p-2 text-sm border rounded-md bg-transparent min-w-[150px]"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="all">{t("admin.reviewFilterAll")}</option>
            <option value="5">{t("admin.reviewFilter5Stars")}</option>
            <option value="4">{t("admin.reviewFilter4Stars")}</option>
            <option value="3">{t("admin.reviewFilter3Stars")}</option>
            <option value="2">{t("admin.reviewFilter2Stars")}</option>
            <option value="1">{t("admin.reviewFilter1Star")}</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="rounded-md border bg-white shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b text-slate-500 font-medium select-none">
              <tr>
                {/* --- CỘT ID (CÓ SORT) --- */}
                <th
                  className="px-4 py-3 w-[80px] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    {t("admin.reviewId")} <SortIcon columnKey="id" />
                  </div>
                </th>

                {/* --- CỘT THỜI GIAN (CÓ SORT) --- */}
                <th
                  className="px-4 py-3 w-[180px] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    {t("admin.reviewTime")} <SortIcon columnKey="createdAt" />
                  </div>
                </th>

                <th className="px-4 py-3 w-[150px]">
                  {t("admin.reviewPoster")}
                </th>
                <th className="px-4 py-3 w-[200px]">
                  {t("admin.reviewTarget")}
                </th>

                {/* --- CỘT SỐ SAO (CÓ SORT) --- */}
                <th
                  className="px-4 py-3 w-[100px] cursor-pointer hover:bg-slate-100 transition-colors"
                  onClick={() => handleSort("rating")}
                >
                  <div className="flex items-center">
                    {t("admin.reviewRating")} <SortIcon columnKey="rating" />
                  </div>
                </th>

                <th className="px-4 py-3">{t("admin.reviewComment")}</th>
                <th className="px-4 py-3 w-[80px] text-center">
                  {t("admin.reviewActions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {paginatedData.map((review) => {
                const isDeleted = review.isDeleted;
                const userInfo = getUserInfo(review.userId);
                const targetName = getLocalizedContent(
                  getTargetName(review.type, review.targetId)
                );

                return (
                  <tr
                    key={review.id}
                    className={`group transition-colors hover:bg-slate-50 ${
                      isDeleted ? "bg-red-50/50 opacity-60" : ""
                    }`}
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500">
                      #{review.id}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {formatDate(review.createdAt)}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                          {userInfo.avatar && (
                            <img
                              src={userInfo.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <span
                          className="truncate max-w-[120px]"
                          title={userInfo.name}
                        >
                          {userInfo.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span
                          className="font-medium truncate max-w-[180px]"
                          title={targetName}
                        >
                          {targetName}
                        </span>
                        <span className="text-[10px] uppercase text-slate-400">
                          {review.type === "restaurant"
                            ? t("admin.restaurant")
                            : t("admin.dish")}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center text-yellow-500">
                        <span className="font-bold mr-1 text-slate-700">
                          {review.rating}
                        </span>
                        <Star className="w-3 h-3 fill-current" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative max-w-[300px]">
                        <p
                          className="line-clamp-2 text-slate-600 text-sm"
                          title={getLocalizedContent(review.comment)}
                        >
                          {getLocalizedContent(review.comment)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!isDeleted ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => setDeleteId(review.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-xs text-red-600 font-bold">
                          {t("admin.reviewDeleted")}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {paginatedData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    {t("admin.reviewNoResults")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- THANH PHÂN TRANG (FOOTER) --- */}
        {filteredData.length > 0 && (
          <div className="border-t bg-slate-50 px-4 py-3 flex items-center justify-between">
            {/* Thông tin hiển thị */}
            <div className="text-xs text-muted-foreground">
              {t("admin.reviewShowResults")}{" "}
              <strong>
                {startIndex + 1}-
                {Math.min(startIndex + ITEMS_PER_PAGE, filteredData.length)}
              </strong>{" "}
              {t("admin.reviewOf")} <strong>{filteredData.length}</strong>{" "}
              {t("admin.reviewResults")}
            </div>

            {/* Các nút điều hướng */}
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Logic hiển thị số trang */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 ${
                          currentPage === page
                            ? "bg-primary text-white pointer-events-none"
                            : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  } else if (
                    page === currentPage - 2 ||
                    page === currentPage + 2
                  ) {
                    return (
                      <span
                        key={page}
                        className="text-xs text-muted-foreground"
                      >
                        ...
                      </span>
                    );
                  }
                  return null;
                }
              )}

              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialog Xóa */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              {t("admin.reviewDeleteConfirmTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.reviewDeleteConfirmMessage")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {t("admin.reviewDeleteCancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {t("admin.reviewDeleteConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
