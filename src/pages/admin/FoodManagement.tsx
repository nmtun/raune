import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Plus, Utensils } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";

// Components
import { DishCard } from "@/components/admin/DishCard";
import { DishFormDialog } from "@/components/admin/DishFormDialog";
import { SearchFilterBar } from "@/components/admin/SearchFilterBar";
import { DeleteConfirmDialog } from "@/components/admin/DeleteConfirmDialog";

// Data
import dishesData from "@/data/menus.json";
import restaurantsData from "@/data/restaurants.json";

// --- TYPES ---
interface Dish {
  id: number;
  restaurantId: number;
  name: string | { vi: string; ja: string };
  category: string;
  price: number;
  rating: number;
  reviews: number;
  photo?: string;
  description?: string | { vi: string; ja: string };
}

interface DishFormData {
  nameVi: string;
  nameJa: string;
  restaurantId: number;
  category: string;
  price: string;
  descriptionVi: string;
  descriptionJa: string;
  photo: string;
}

export default function FoodManagement() {
  const [sortOption, setSortOption] = useState<string>("rating-high");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState<DishFormData>({
    nameVi: "",
    nameJa: "",
    restaurantId: 0,
    category: "Vietnamese",
    price: "",
    descriptionVi: "",
    descriptionJa: "",
    photo: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { t, language, getLocalizedContent } = useLanguage();
  const { toast } = useToast();

  // Load dishes from localStorage or use default data
  useEffect(() => {
    const loadDishes = () => {
      const savedDishes = localStorage.getItem("dishes");
      if (savedDishes) {
        try {
          const parsed = JSON.parse(savedDishes);
          // Kiểm tra JSON có phải array không
          if (Array.isArray(parsed) && parsed.length >= 0) {
            setDishes(parsed);
          } else {
            console.warn("Invalid dishes format, using default data");
            setDishes(dishesData);
            toast({
              title: t("admin.dataError") || "Lỗi dữ liệu",
              description:
                t("admin.dataErrorDesc") ||
                "Dữ liệu món ăn không hợp lệ. Đã tải dữ liệu mặc định.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error parsing dishes:", error);
          setDishes(dishesData);
          toast({
            title: t("admin.parseError") || "Lỗi đọc dữ liệu",
            description:
              t("admin.parseErrorDesc") ||
              "Không thể đọc dữ liệu món ăn. Đã tải dữ liệu mặc định.",
            variant: "destructive",
          });
        }
      } else {
        setDishes(dishesData);
      }
    };

    // Initial load
    loadDishes();

    // Listen for storage events (when dishes are updated in other tabs/components)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dishes") {
        loadDishes();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check periodically for changes (in case same tab updates)
    const interval = setInterval(() => {
      loadDishes();
    }, 2000); // Check every 2 seconds

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [toast, t]);

  // --- HÀM TRA CỨU ---
  const getRestaurantInfo = (restaurantId: number) => {
    const restaurant = restaurantsData.find((r) => r.id === restaurantId);
    return {
      name: restaurant ? restaurant.name : `Restaurant #${restaurantId}`,
      address: restaurant ? restaurant.address : "",
    };
  };

  const categories = useMemo(() => {
    const uniqueCategories = new Set(dishes.map((dish) => dish.category));
    return ["all", ...Array.from(uniqueCategories)];
  }, [dishes]);

  // --- VALIDATION FUNCTION ---
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.nameVi.trim()) {
      errors.nameVi = "Tên món tiếng Việt không được để trống";
    }
    if (!formData.nameJa.trim()) {
      errors.nameJa = "Tên món tiếng Nhật không được để trống";
    }
    if (!formData.restaurantId || formData.restaurantId === 0) {
      errors.restaurant = "Vui lòng chọn nhà hàng";
    }
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      errors.price = "Giá phải là số dương";
    }
    if (!formData.category) {
      errors.category = "Vui lòng chọn danh mục";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // --- CRUD FUNCTIONS ---
  const handleOpenAddDialog = () => {
    setFormData({
      nameVi: "",
      nameJa: "",
      restaurantId: restaurantsData[0]?.id || 0,
      category: "Vietnamese",
      price: "",
      descriptionVi: "",
      descriptionJa: "",
      photo: "",
    });
    setFormErrors({});
    setIsAddDialogOpen(true);
  };

  const handleAddDish = () => {
    if (!validateForm()) return;

    const newDish: Dish = {
      id: Math.max(...dishes.map((d) => d.id), 0) + 1,
      restaurantId: formData.restaurantId,
      name: { vi: formData.nameVi, ja: formData.nameJa },
      category: formData.category,
      price: parseFloat(formData.price),
      rating: 0,
      reviews: 0,
      photo: formData.photo || "/food-photos/default.jpg",
      description: { vi: formData.descriptionVi, ja: formData.descriptionJa },
    };

    const updatedDishes = [...dishes, newDish];
    setDishes(updatedDishes);
    localStorage.setItem("dishes", JSON.stringify(updatedDishes));
    setIsAddDialogOpen(false);
    setCurrentPage(1);

    toast({
      title: t("admin.createSuccess") || "Thêm món ăn thành công",
      description: `${formData.nameVi} đã được thêm vào danh sách`,
    });
  };

  const handleOpenEditDialog = (dish: Dish) => {
    setSelectedDish(dish);
    const name =
      typeof dish.name === "string"
        ? { vi: dish.name, ja: dish.name }
        : dish.name;
    const desc =
      typeof dish.description === "string"
        ? { vi: dish.description || "", ja: dish.description || "" }
        : dish.description || { vi: "", ja: "" };

    setFormData({
      nameVi: name.vi,
      nameJa: name.ja,
      restaurantId: dish.restaurantId,
      category: dish.category,
      price: dish.price.toString(),
      descriptionVi: desc.vi,
      descriptionJa: desc.ja,
      photo: dish.photo || "",
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleUpdateDish = () => {
    if (!validateForm() || !selectedDish) return;

    const updatedDishes = dishes.map((dish) =>
      dish.id === selectedDish.id
        ? {
            ...dish,
            name: { vi: formData.nameVi, ja: formData.nameJa },
            restaurantId: formData.restaurantId,
            category: formData.category,
            price: parseFloat(formData.price),
            description: {
              vi: formData.descriptionVi,
              ja: formData.descriptionJa,
            },
            photo: formData.photo,
          }
        : dish
    );

    setDishes(updatedDishes);
    localStorage.setItem("dishes", JSON.stringify(updatedDishes));
    setIsEditDialogOpen(false);
    setSelectedDish(null);

    toast({
      title: t("admin.updateSuccess") || "Cập nhật thành công",
      description: `${formData.nameVi} đã được cập nhật`,
    });
  };

  const handleOpenDeleteDialog = (dish: Dish) => {
    setSelectedDish(dish);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDish = () => {
    if (!selectedDish) {
      toast({
        title: t("admin.error") || "Lỗi",
        description:
          t("admin.noDishSelected") || "Không có món ăn nào được chọn",
        variant: "destructive",
      });
      return;
    }

    const dishName =
      typeof selectedDish.name === "string"
        ? selectedDish.name
        : selectedDish.name.vi;
    const updatedDishes = dishes.filter((dish) => dish.id !== selectedDish.id);
    setDishes(updatedDishes);
    localStorage.setItem("dishes", JSON.stringify(updatedDishes));
    setIsDeleteDialogOpen(false);
    setSelectedDish(null);

    toast({
      title: t("admin.deleteSuccess") || "Xóa thành công",
      description: `${dishName} đã được xóa khỏi danh sách`,
    });

    // Adjust page if current page is empty
    const totalPages = Math.ceil(updatedDishes.length / itemsPerPage);
    if (currentPage > totalPages) {
      setCurrentPage(Math.max(1, totalPages));
    }
  };

  // --- LOGIC LỌC VÀ SẮP XẾP ---
  const filteredAndSortedDishes = useMemo(() => {
    let filtered = [...dishes];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((dish) => {
        const dishName =
          typeof dish.name === "string"
            ? dish.name
            : `${dish.name.vi} ${dish.name.ja}`;
        return dishName.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((dish) => dish.category === filterCategory);
    }

    // Sort
    switch (sortOption) {
      case "price-high":
        return filtered.sort((a, b) => b.price - a.price);
      case "price-low":
        return filtered.sort((a, b) => a.price - b.price);
      case "rating-high":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "rating-low":
        return filtered.sort((a, b) => a.rating - b.rating);
      case "popular":
        return filtered.sort((a, b) => b.reviews - a.reviews);
      default:
        return filtered;
    }
  }, [sortOption, filterCategory, searchQuery, dishes]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedDishes.length / itemsPerPage);
  const paginatedDishes = filteredAndSortedDishes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      Vietnamese: t("filter.vietnamese") || "Món Việt",
      Japanese: t("filter.japanese") || "Món Nhật",
      Korean: t("filter.korean") || "Món Hàn",
      Chinese: t("filter.chinese") || "Món Trung",
      Western: t("filter.western") || "Món Âu",
      Asian: t("filter.asian") || "Món Á",
      "Fast Food": t("filter.fastFood") || "Fast Food",
      Cafe: t("filter.cafe") || "Cafe",
    };
    return categoryMap[category] || category;
  };

  const handleFormChange = (data: DishFormData) => {
    setFormData(data);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-4">
          {t("admin.dishManagement") || "Quản lý Món ăn"}
        </h1>
        <div className="flex gap-3 items-start">
          {/* Search & Filter Bar */}
          <div className="flex-1">
            <SearchFilterBar
              searchQuery={searchQuery}
              filterCategory={filterCategory}
              sortOption={sortOption}
              categories={categories}
              onSearchChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
              onCategoryChange={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
              onSortChange={setSortOption}
            />
          </div>

          {/* Add Button */}
          <Button onClick={handleOpenAddDialog} className="gap-2 h-10">
            <Plus className="w-4 h-4" />
            {t("admin.Add new dish") || "Thêm món ăn mới"}
          </Button>
        </div>

        <p className="text-muted-foreground mt-3">
          {t("admin.sum") || "Tổng số"}:{" "}
          <span className="font-bold text-primary">
            {filteredAndSortedDishes.length}
          </span>{" "}
          {t("admin.dish") || "món ăn"}
        </p>
      </div>

      {/* Grid Dishes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {paginatedDishes.map((dish) => {
          const restaurantInfo = getRestaurantInfo(dish.restaurantId);
          const dishName = getLocalizedContent(dish.name);
          const dishDescription = dish.description
            ? getLocalizedContent(dish.description)
            : "";

          return (
            <DishCard
              key={dish.id}
              dish={dish}
              restaurantName={restaurantInfo.name}
              restaurantAddress={restaurantInfo.address}
              dishName={dishName}
              dishDescription={dishDescription}
              onEdit={handleOpenEditDialog}
              onDelete={handleOpenDeleteDialog}
              formatPrice={formatPrice}
              t={t}
              getCategoryLabel={getCategoryLabel}
            />
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={
                  currentPage === 1
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>

            {/* ✅ Logic hiển thị 5 trang */}
            {(() => {
              const pages = [];
              const maxVisible = 5; // Số trang tối đa hiển thị
              let startPage = Math.max(1, currentPage - 2);
              const endPage = Math.min(totalPages, startPage + maxVisible - 1);

              // Adjust nếu gần cuối
              if (endPage - startPage < maxVisible - 1) {
                startPage = Math.max(1, endPage - maxVisible + 1);
              }

              // Trang đầu + ellipsis
              if (startPage > 1) {
                pages.push(
                  <PaginationItem key={1}>
                    <PaginationLink
                      onClick={() => setCurrentPage(1)}
                      className="cursor-pointer"
                    >
                      1
                    </PaginationLink>
                  </PaginationItem>
                );
                if (startPage > 2) {
                  pages.push(
                    <PaginationItem key="ellipsis-start">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
              }

              // Các trang giữa
              for (let i = startPage; i <= endPage; i++) {
                pages.push(
                  <PaginationItem key={i}>
                    <PaginationLink
                      onClick={() => setCurrentPage(i)}
                      isActive={currentPage === i}
                      className="cursor-pointer"
                    >
                      {i}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              // Ellipsis + trang cuối
              if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                  pages.push(
                    <PaginationItem key="ellipsis-end">
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }
                pages.push(
                  <PaginationItem key={totalPages}>
                    <PaginationLink
                      onClick={() => setCurrentPage(totalPages)}
                      className="cursor-pointer"
                    >
                      {totalPages}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              return pages;
            })()}

            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                className={
                  currentPage === totalPages
                    ? "pointer-events-none opacity-50"
                    : "cursor-pointer"
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Empty State */}
      {filteredAndSortedDishes.length === 0 && (
        <div className="text-center py-12">
          <Utensils className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-semibold text-slate-600 mb-2">
            Không tìm thấy món ăn
          </h3>
          <p className="text-sm text-muted-foreground">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <DishFormDialog
        isOpen={isAddDialogOpen || isEditDialogOpen}
        mode={isAddDialogOpen ? "add" : "edit"}
        formData={formData}
        formErrors={formErrors}
        restaurants={restaurantsData}
        onClose={() => {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedDish(null);
        }}
        onSubmit={isAddDialogOpen ? handleAddDish : handleUpdateDish}
        onFormChange={handleFormChange}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        itemName={selectedDish ? getLocalizedContent(selectedDish.name) : ""}
        itemType="món ăn"
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteDish}
      />
    </div>
  );
}
