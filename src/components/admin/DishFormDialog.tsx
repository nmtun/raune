import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { Upload, X } from "lucide-react";
import { useRef } from "react";
import { useToast } from "@/hooks/use-toast";

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

interface Restaurant {
  id: number;
  name: string;
}

interface DishFormDialogProps {
  isOpen: boolean;
  mode: "add" | "edit";
  formData: DishFormData;
  formErrors: Record<string, string>;
  restaurants: Restaurant[];
  onClose: () => void;
  onSubmit: () => void;
  onFormChange: (data: DishFormData) => void;
}

export function DishFormDialog({
  isOpen,
  mode,
  formData,
  formErrors,
  restaurants,
  onClose,
  onSubmit,
  onFormChange,
}: DishFormDialogProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: t("profile.validationError") || "Lỗi",
        description:
          t("profile.invalidImageFormat") ||
          "Định dạng hình ảnh không hợp lệ. Vui lòng chọn PNG hoặc JPEG",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Validate file size (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: t("profile.validationError") || "Lỗi",
        description:
          t("profile.imageTooLarge") ||
          "Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 20MB",
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      onFormChange({ ...formData, photo: result });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    onFormChange({ ...formData, photo: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "add"
              ? t("admin.Add new dish") || "Thêm món ăn mới"
              : t("admin.Edit dish") || "Chỉnh sửa món ăn"}
          </DialogTitle>
          <DialogDescription>
            {t("admin.Fill all fields") ||
              "Điền đầy đủ thông tin món ăn. Các trường có dấu * là bắt buộc."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Name Vietnamese */}
          <div className="grid gap-2">
            <Label htmlFor="nameVi">
              {t("admin.Dish name (Vietnamese)") || "Tên món (Tiếng Việt)"} *
            </Label>
            <Input
              id="nameVi"
              value={formData.nameVi}
              onChange={(e) =>
                onFormChange({ ...formData, nameVi: e.target.value })
              }
              placeholder="Ví dụ: Phở Bò"
            />
            {formErrors.nameVi && (
              <p className="text-sm text-red-600">{formErrors.nameVi}</p>
            )}
          </div>

          {/* Name Japanese */}
          <div className="grid gap-2">
            <Label htmlFor="nameJa">
              {t("admin.Dish name (Japanese)") || "Tên món (Tiếng Nhật)"} *
            </Label>
            <Input
              id="nameJa"
              value={formData.nameJa}
              onChange={(e) =>
                onFormChange({ ...formData, nameJa: e.target.value })
              }
              placeholder="例: 牛肉フォー"
            />
            {formErrors.nameJa && (
              <p className="text-sm text-red-600">{formErrors.nameJa}</p>
            )}
          </div>

          {/* Restaurant */}
          <div className="grid gap-2">
            <Label htmlFor="restaurant">
              {t("admin.Restaurant") || "Nhà hàng"} *
            </Label>
            <Select
              value={formData.restaurantId.toString()}
              onValueChange={(value) =>
                onFormChange({ ...formData, restaurantId: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn nhà hàng" />
              </SelectTrigger>
              <SelectContent>
                {restaurants.map((restaurant) => (
                  <SelectItem
                    key={restaurant.id}
                    value={restaurant.id.toString()}
                  >
                    {restaurant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.restaurant && (
              <p className="text-sm text-red-600">{formErrors.restaurant}</p>
            )}
          </div>

          {/* Category & Price */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="category">
                {t("admin.Category") || "Danh mục"} *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  onFormChange({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("filter.selectCategory") || "Chọn danh mục"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Vietnamese">
                    {t("filter.vietnamese") || "Món Việt"}
                  </SelectItem>
                  <SelectItem value="Japanese">
                    {t("filter.japanese") || "Món Nhật"}
                  </SelectItem>
                  <SelectItem value="Korean">
                    {t("filter.korean") || "Món Hàn"}
                  </SelectItem>
                  <SelectItem value="Chinese">
                    {t("filter.chinese") || "Món Trung"}
                  </SelectItem>
                  <SelectItem value="Western">
                    {t("filter.western") || "Món Âu"}
                  </SelectItem>
                </SelectContent>
              </Select>
              {formErrors.category && (
                <p className="text-sm text-red-600">{formErrors.category}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">{t("admin.Price") || "Giá"} (VND) *</Label>
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) =>
                  onFormChange({ ...formData, price: e.target.value })
                }
                placeholder="45000"
              />
              {formErrors.price && (
                <p className="text-sm text-red-600">{formErrors.price}</p>
              )}
            </div>
          </div>

          {/* Photo Upload */}
          <div className="grid gap-2">
            <Label htmlFor="photo">{t("admin.Image") || "Hình ảnh"}</Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                {t("profile.uploadImage") || "Tải ảnh lên"}
              </Button>
              {formData.photo && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="text-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
            {formData.photo && (
              <div className="mt-2 w-32 h-32 rounded-lg border overflow-hidden">
                <img
                  src={formData.photo}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">
              {t("dishDetail.description") || "Mô tả"}
            </Label>
            <Textarea
              id="description"
              value={formData.descriptionVi}
              onChange={(e) =>
                onFormChange({ 
                  ...formData, 
                  descriptionVi: e.target.value,
                  descriptionJa: e.target.value  // Sync cả 2 field
                })
              }
              placeholder={t("admin.Description about dish") || "Mô tả món ăn"}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("profile.cancel") || "Hủy"}
          </Button>
          <Button onClick={onSubmit}>
            {mode === "add"
              ? t("admin.Add new dish") || "Thêm món"
              : t("admin.Update") || "Lưu thay đổi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
