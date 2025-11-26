import { useState } from 'react';
import { Star, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

interface Dish {
  id: number;
  name: string;
  price: number;
  rating: number;
  reviews: number;
  photo: string;
}

interface RestaurantCardProps {
  id: number;
  name: string;
  address: string;
  distance: string;
  rating: number;
  reviews: number;
  tags: string[];
  photo: string;
  category: string;
  dishes?: Dish[];
}

export function RestaurantCard({
  id,
  name,
  address,
  distance,
  rating,
  reviews,
  tags,
  photo,
  category,
  dishes = [],
}: RestaurantCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useLanguage();

  return (
    <div className="bg-card rounded-xl border border-border hover:shadow-md transition-all duration-300 overflow-hidden">
      <img
        src={photo}
        alt={name}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-card-foreground">{name}</h3>
        <div className="flex items-start space-x-1 text-sm text-muted-foreground mt-1">
          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p className="line-clamp-1">{address}</p>
        </div>
        <p className="text-xs text-accent font-medium mt-2">{distance} {t('common.away')}</p>
        
        <div className="flex items-center mt-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm ml-1 text-foreground">
            {rating} <span className="text-muted-foreground">({reviews} {t('common.reviews')})</span>
          </span>
        </div>
        
        <div className="flex flex-wrap gap-1 mt-3">
          <span className="px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded-full">
            {category}
          </span>
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs bg-accent/10 text-accent rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
        
        {dishes.length > 0 && (
          <>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full mt-4 flex items-center justify-center gap-2"
              variant="default"
            >
              {isExpanded ? t('common.hideMenu') : t('common.viewMenu')}
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            
            {isExpanded && (
              <div className="mt-4 space-y-3 border-t border-border pt-4">
                <h4 className="font-semibold text-sm text-foreground">{t('common.featuredDishes')}</h4>
                {dishes.map((dish) => (
                  <div key={dish.id} className="flex gap-3 bg-secondary/20 rounded-lg p-2">
                    <img
                      src={dish.photo}
                      alt={dish.name}
                      className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                      loading="lazy"
                    />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm text-card-foreground truncate">{dish.name}</h5>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs text-muted-foreground">
                          {dish.rating} ({dish.reviews})
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-primary mt-1">
                        {dish.price.toLocaleString('vi-VN')} ₫
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
