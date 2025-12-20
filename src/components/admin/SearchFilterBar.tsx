import { Search, Tag, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";

interface SearchFilterBarProps {
  searchQuery: string;
  filterCategory: string;
  sortOption: string;
  categories: string[];
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
  getCategoryLabel?: (category: string) => string;
}

export function SearchFilterBar({
  searchQuery,
  filterCategory,
  sortOption,
  categories,
  onSearchChange,
  onCategoryChange,
  onSortChange,
  getCategoryLabel: getCategoryLabelProp,
}: SearchFilterBarProps) {
  const { t } = useLanguage();

  // Use provided function or create default
  const getCategoryLabel =
    getCategoryLabelProp ||
    ((category: string) => {
      const categoryMap: Record<string, string> = {
        all: t("filter.allCategories") || "Tất cả danh mục",
        Vietnamese: t("filter.vietnamese") || "Món Việt",
        Japanese: t("filter.japanese") || "Món Nhật",
        Korean: t("filter.korean") || "Món Hàn",
        Chinese: t("filter.chinese") || "Món Trung",
        Western: t("filter.western") || "Món Âu",
      };
      return categoryMap[category] || category;
    });

  // Helper function to get translated sort option
  const getSortLabel = (option: string) => {
    const sortMap: Record<string, string> = {
      name: t("sort.name") || "Tên: A-Z",
      "price-high": t("sort.priceHighToLow") || "Giá: Cao đến Thấp",
      "price-low": t("sort.priceLowToHigh") || "Giá: Thấp đến Cao",
      "rating-high": t("sort.ratingHighToLow") || "Đánh giá: Cao đến Thấp",
      "rating-low": t("sort.ratingLowToHigh") || "Đánh giá: Thấp đến Cao",
      popular: t("sort.popular") || "Phổ biến nhất",
    };
    return sortMap[option] || option;
  };

  return (
    <div className="flex flex-col md:flex-row gap-3 items-center">
      {/* Search Bar */}
      <div className="relative flex-1 w-full">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={
            t("search.searchDishes") || "Tìm kiếm món ăn theo tên..."
          }
          value={searchQuery}
          onChange={(e) => {
            onSearchChange(e.target.value);
          }}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
      <div className="w-full md:w-[200px]">
        <Select value={filterCategory} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-full">
            <Tag className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue
              placeholder={t("filter.selectCategory") || "Chọn danh mục"}
            />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {getCategoryLabel(cat)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort Dropdown */}
      <div className="w-full md:w-[220px]">
        <Select value={sortOption} onValueChange={onSortChange}>
          <SelectTrigger className="w-full">
            <ArrowUpDown className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder={t("sort.sortBy") || "Sắp xếp theo"} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price-high">
              {getSortLabel("price-high")}
            </SelectItem>
            <SelectItem value="price-low">
              {getSortLabel("price-low")}
            </SelectItem>
            <SelectItem value="rating-high">
              {getSortLabel("rating-high")}
            </SelectItem>
            <SelectItem value="rating-low">
              {getSortLabel("rating-low")}
            </SelectItem>
            <SelectItem value="popular">{getSortLabel("popular")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
