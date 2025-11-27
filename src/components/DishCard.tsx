import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

interface DishCardProps {
  name: string;
  restaurantName: string;
  distance: string;
  rating: number;
  reviews: number;
  price: number;
  photo: string;
}

export function DishCard({
  name,
  restaurantName,
  distance,
  rating,
  reviews,
  price,
  photo,
}: DishCardProps) {
  const { t } = useLanguage();

  const handleViewDetails = () => {
    toast(t('common.viewing', { dish: name }));
  };

  return (
    <div className="flex-shrink-0 w-64 bg-card rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col">
      <img
        src={photo}
        alt={name}
        className="w-full h-40 object-cover"
        loading="lazy"
      />
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-lg text-card-foreground line-clamp-1">{name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{restaurantName}</p>
        <p className="text-xs text-accent font-medium mt-1">{distance} {t('common.away')}</p>
        
        <div className="flex items-center mt-2">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm ml-1 text-foreground">
            {rating} <span className="text-muted-foreground">({reviews} {t('common.reviews')})</span>
          </span>
        </div>
        
        <p className="text-sm font-semibold text-primary mt-2 mb-3">
          {price.toLocaleString('vi-VN')} VND
        </p>
        
        <Button
          onClick={handleViewDetails}
          className="w-full mt-auto"
          size="sm"
        >
          {t('common.viewDetails')}
        </Button>
      </div>
    </div>
  );
}
