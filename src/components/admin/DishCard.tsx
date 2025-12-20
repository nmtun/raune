import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  DollarSign,
  Utensils,
  MapPin,
  TrendingUp,
  Edit,
  Trash2,
} from "lucide-react";

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

interface DishCardProps {
  dish: Dish;
  restaurantName: string;
  restaurantAddress: string;
  dishName: string;
  dishDescription: string;
  onEdit: (dish: Dish) => void;
  onDelete: (dish: Dish) => void;
  formatPrice: (price: number) => string;
  t: (key: string) => string;
  getCategoryLabel: (category: string) => string;
}

export function DishCard({
  dish,
  restaurantName,
  restaurantAddress,
  dishName,
  dishDescription,
  onEdit,
  onDelete,
  formatPrice,
  t,
  getCategoryLabel,
}: DishCardProps) {
  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow border-t-4 border-t-transparent hover:border-t-primary">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-3">
          {/* Dish Image */}
          <div className="w-20 h-20 rounded-lg border border-slate-200 overflow-hidden flex-shrink-0">
            {dish.photo ? (
              <img
                src={dish.photo}
                alt={dishName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <Utensils className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>

          {/* Dish Info */}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-bold truncate">
              {dishName}
            </CardTitle>
            <Badge variant="secondary" className="mt-2 text-xs">
              {getCategoryLabel(dish.category)}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onEdit(dish)}
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={() => onDelete(dish)}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-3">
        {/* Price */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground flex items-center">
              <DollarSign className="w-3 h-3" />
              {t("price") || "Giá"}
            </span>
            <span className="font-bold text-green-700 text-lg">
              {formatPrice(dish.price)}
            </span>
          </div>
        </div>

        {/* Description */}
        {dishDescription && (
          <p className="text-xs text-slate-600 line-clamp-2 italic">
            {dishDescription}
          </p>
        )}

        {/* Restaurant Info */}
        <div className="pt-2 border-t border-dashed">
          <div className="flex items-start gap-2 text-xs">
            <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {restaurantName}
              </p>
              <p className="text-muted-foreground text-xs truncate">
                {restaurantAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="font-medium">{dish.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>
              {dish.reviews} {t("admin.review") || "Đánh giá"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
