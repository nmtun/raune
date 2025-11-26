import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { DishCard } from '@/components/DishCard';
import { RestaurantLogo } from '@/components/RestaurantLogo';
import { LocationMap } from '@/components/LocationMap';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRecommendations } from '@/hooks/useRecommendations';
import { formatDistance } from '@/utils/distance';
import { useNavigate } from 'react-router-dom';
import { Truck, Star, Leaf, ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import restaurantsData from '@/data/restaurants.json';
import { useRef } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

const Index = () => {
  const navigate = useNavigate();
  const location = useGeolocation();
  const recommendations = useRecommendations(location.lat, location.lng);
  const restaurantScrollRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const handleRefreshLocation = () => {
    location.refreshLocation();
  };

  const scrollRestaurants = (direction: 'left' | 'right') => {
    if (restaurantScrollRef.current) {
      const scrollAmount = 300;
      restaurantScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        location={location.isFallback ? t('location.defaultLocation') : t('location.yourLocation')}
        userName={t('header.customer')}
        onRefreshLocation={handleRefreshLocation}
        isLoadingLocation={location.loading}
        isFallbackLocation={location.isFallback}
      />

      {/* Hero Section */}
      <section className="bg-gradient-hero py-12 md:py-16">
        <div className="container mx-auto px-4">
          {/* Location Alert */}
          {location.isFallback && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">{t('location.enableLocationTitle')}</p>
                  <p className="text-xs mt-1">{t('location.enableLocationDesc')}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefreshLocation}
                  className="mt-2 text-xs"
                  disabled={location.loading}
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${location.loading ? 'animate-spin' : ''}`} />
                  {t('location.tryAgain')}
                </Button>
              </div>
            </div>
          )}

          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('hero.title')}
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              {t('hero.subtitle')}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/search')}
                className="text-lg"
              >
                {t('hero.findRestaurants')}
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => {
                  document.getElementById('recommendations-dishes')?.scrollIntoView({
                    behavior: 'smooth',
                  });
                }}
              >
                {t('hero.viewNearby')}
              </Button>
            </div>

            {/* Service Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12">
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Truck className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{t('hero.fastDelivery')}</h3>
                <p className="text-sm text-muted-foreground">{t('hero.fastDeliveryDesc')}</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{t('hero.highQuality')}</h3>
                <p className="text-sm text-muted-foreground">{t('hero.highQualityDesc')}</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-foreground">{t('hero.nutrition')}</h3>
                <p className="text-sm text-muted-foreground">{t('hero.nutritionDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Dishes Section */}
      <section id="recommendations-dishes" className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">{t('sections.recommendedDishes')}</h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/search?sort=rating')}
            >
              {t('sections.seeMore')}
            </Button>
          </div>

          {location.loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
              {recommendations.dishes.map(({ restaurant, menu, distance }) => (
                menu && (
                  <DishCard
                    key={menu.id}
                    name={menu.name}
                    restaurantName={restaurant.name}
                    distance={formatDistance(distance)}
                    rating={menu.rating}
                    reviews={menu.reviews}
                    price={menu.price}
                    photo={menu.photo}
                  />
                )
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Recommended Restaurants Section */}
      <section id="recommendations-restaurants" className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-foreground">{t('sections.topRestaurants')}</h2>
            <Button
              variant="ghost"
              onClick={() => navigate('/search?sort=closest')}
            >
              {t('sections.seeAll')}
            </Button>
          </div>

          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={() => scrollRestaurants('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background rounded-full p-2 shadow-lg hidden md:block"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scrollRestaurants('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/90 hover:bg-background rounded-full p-2 shadow-lg hidden md:block"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Restaurant Logos */}
            {location.loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div
                ref={restaurantScrollRef}
                className="flex gap-8 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide px-4"
              >
                {recommendations.restaurants.map(({ restaurant }) => (
                  <RestaurantLogo
                    key={restaurant.id}
                    name={restaurant.name}
                    photo={restaurant.photo}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Location Map Section */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4">
          <LocationMap
            userLat={location.lat}
            userLng={location.lng}
            restaurants={recommendations.restaurants.map(({ restaurant, distance }) => ({
              id: restaurant.id,
              name: restaurant.name,
              lat: restaurant.lat,
              lng: restaurant.lng,
              distance,
            }))}
            onRefreshLocation={handleRefreshLocation}
            isLoadingLocation={location.loading}
          />
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
