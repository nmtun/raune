import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { DishDetailDialog } from '@/components/DishDetailDialog';
import { ReviewSection } from '@/components/ReviewSection';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useLanguage } from '@/hooks/useLanguage';
import { ArrowLeft, MapPin, Star } from 'lucide-react';
import restaurantsData from '@/data/restaurants.json';
import menusData from '@/data/menus.json';
import { formatDistance, calculateDistance } from '@/utils/distance';
import { useState } from 'react';

const RestaurantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useGeolocation();
  const { t, language } = useLanguage();
  const [selectedDish, setSelectedDish] = useState<any | null>(null);

  // Find restaurant by ID
  const restaurant = restaurantsData.find((r) => r.id === Number(id));

  // Find menus for this restaurant
  const restaurantMenus = menusData.filter((m) => m.restaurantId === Number(id));

  // Calculate distance
  const distance = restaurant
    ? calculateDistance(location.lat, location.lng, restaurant.lat, restaurant.lng)
    : 0;

  // Helper to get dish name
  const getDishName = (dishName: string | { vi: string; ja: string }) => {
    if (typeof dishName === 'string') {
      return dishName;
    }
    return dishName[language as keyof typeof dishName] || dishName.vi;
  };

  if (!restaurant) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header
          location={location.isFallback ? t('location.defaultLocation') : t('location.yourLocation')}
          onRefreshLocation={location.refreshLocation}
          isLoadingLocation={location.loading}
          isFallbackLocation={location.isFallback}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {t('restaurantDetail.notFound')}
            </h2>
            <Button onClick={() => navigate('/')}>
              {t('restaurantDetail.backToHome')}
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        location={location.isFallback ? t('location.defaultLocation') : t('location.yourLocation')}
        onRefreshLocation={location.refreshLocation}
        isLoadingLocation={location.loading}
        isFallbackLocation={location.isFallback}
      />

      <div className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('restaurantDetail.back')}
          </Button>

          {/* Restaurant Header - Full Width */}
          <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mb-6">
            <div className="relative h-64 md:h-80">
              <img
                src={restaurant.photo}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium">
                {formatDistance(distance)}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                    {restaurant.name}
                  </h1>

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center bg-yellow-50 px-3 py-1 rounded-lg">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 mr-1" />
                      <span className="text-xl font-bold text-foreground">
                        {restaurant.rating}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({restaurant.reviews} {t('common.reviews')})
                    </span>
                  </div>

                  {/* Category Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full font-medium">
                      {t(`categories.${restaurant.category.toLowerCase()}`) || restaurant.category}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Store Info Box - Left Column */}
                <div className="lg:col-span-2">
                  <div className="bg-primary/10 border-2 border-primary/30 rounded-lg p-5">
                    <h3 className="text-lg font-bold text-primary mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2" />
                      {t('restaurantDetail.storeInfo')}
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start">
                        <span className="text-sm text-foreground">
                          <span className="font-medium">{t('restaurantDetail.address')}:</span>{' '}
                          {restaurant.address}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {restaurant.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 text-xs bg-primary/20 text-primary rounded-full font-medium"
                          >
                            {t(`tags.${tag}`) || tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mt-4 pt-4 border-t border-primary/20">
                      <p className="text-sm text-foreground/80 leading-relaxed">
                        {t('restaurantDetail.description', {
                          name: restaurant.name,
                          category: t(`categories.${restaurant.category.toLowerCase()}`),
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opening Hours - Right Column */}
                <div className="lg:col-span-1">
                  <div className="bg-background border-2 border-border rounded-lg p-5">
                    <h3 className="text-lg font-bold text-foreground mb-4">
                      {t('restaurantDetail.openingHours')}
                    </h3>
                    <div className="space-y-2">
                      {[
                        { day: t('restaurantDetail.monday'), hours: '8:00~23:00' },
                        { day: t('restaurantDetail.tuesday'), hours: '8:00~23:00' },
                        { day: t('restaurantDetail.wednesday'), hours: '8:00~23:00' },
                        { day: t('restaurantDetail.thursday'), hours: '8:00~23:00' },
                        { day: t('restaurantDetail.friday'), hours: '8:00~23:00' },
                        { day: t('restaurantDetail.saturday'), hours: '8:00~23:00' },
                        { day: t('restaurantDetail.sunday'), hours: '8:00~23:00' },
                      ].map((schedule, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm py-1"
                        >
                          <span className="text-foreground font-medium">{schedule.day}</span>
                          <span className="text-foreground">{schedule.hours}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Section */}
          {restaurantMenus.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm mb-6">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-primary mb-6 flex items-center">
                  <span className="mr-2">🍽️</span>
                  {t('restaurantDetail.menu')}
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {restaurantMenus.map((menu) => (
                    <div
                      key={menu.id}
                      className="border-2 border-primary/30 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => setSelectedDish(menu)}
                    >
                      <div className="relative h-32">
                        <img
                          src={menu.photo}
                          alt={getDishName(menu.name)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-3 bg-background">
                        <h3 className="font-bold text-sm text-foreground mb-2 line-clamp-1 hover:text-primary transition-colors">
                          {getDishName(menu.name)}
                        </h3>
                        <div className="flex items-center mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < Math.floor(menu.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="text-xs text-muted-foreground ml-1">
                            ({menu.reviews})
                          </span>
                        </div>
                        <p className="text-base font-bold text-primary">
                          {menu.price.toLocaleString('vi-VN')} VND
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <ReviewSection restaurantId={restaurant.id} restaurantName={restaurant.name} />
        </div>
      </div>

      <Footer />

      {/* Dish Detail Dialog */}
      {selectedDish && restaurant && (
        <DishDetailDialog
          open={!!selectedDish}
          onOpenChange={(open) => !open && setSelectedDish(null)}
          dish={selectedDish}
          restaurant={restaurant}
        />
      )}
    </div>
  );
};

export default RestaurantDetail;

