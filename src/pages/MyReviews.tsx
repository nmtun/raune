import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';
import { Star, MapPin, UtensilsCrossed, Store, Calendar, Edit2 } from 'lucide-react';
import reviewsData from '@/data/reviews.json';
import restaurantsData from '@/data/restaurants.json';
import menusData from '@/data/menus.json';
import usersData from '@/data/users.json';

interface Review {
  id: number;
  userId: number;
  type: 'restaurant' | 'dish';
  targetId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string | null;
  isEdited: boolean;
}

const MyReviews = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const currentUser = usersData[0]; // Current logged in user

  // Load reviews from localStorage
  useEffect(() => {
    const savedReviews = localStorage.getItem('reviews');
    let allReviews: Review[] = [];
    
    if (savedReviews) {
      try {
        allReviews = JSON.parse(savedReviews);
      } catch (error) {
        allReviews = reviewsData as Review[];
      }
    } else {
      allReviews = reviewsData as Review[];
    }
    
    // Filter only current user's reviews
    const userReviews = allReviews.filter((r) => r.userId === currentUser.id);
    setReviews(userReviews);
  }, []);

  // Get restaurant reviews
  const restaurantReviews = reviews.filter((r) => r.type === 'restaurant');
  
  // Get dish reviews
  const dishReviews = reviews.filter((r) => r.type === 'dish');

  // Helper to get dish name
  const getDishName = (dishId: number) => {
    const dish = menusData.find((m) => m.id === dishId);
    if (!dish) return '';
    if (typeof dish.name === 'string') return dish.name;
    return dish.name[language as keyof typeof dish.name] || dish.name.vi;
  };

  // Helper to get restaurant name
  const getRestaurantName = (restaurantId: number) => {
    const restaurant = restaurantsData.find((r) => r.id === restaurantId);
    return restaurant?.name || '';
  };

  // Helper to get restaurant for a dish
  const getRestaurantForDish = (dishId: number) => {
    const dish = menusData.find((m) => m.id === dishId);
    if (!dish) return null;
    return restaurantsData.find((r) => r.id === dish.restaurantId);
  };

  // Navigate to restaurant detail
  const handleNavigateToRestaurant = (restaurantId: number) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  const renderRestaurantReview = (review: Review) => {
    const restaurant = restaurantsData.find((r) => r.id === review.targetId);
    if (!restaurant) return null;

    return (
      <div
        key={review.id}
        className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleNavigateToRestaurant(restaurant.id)}
      >
        <div className="flex gap-4">
          <img
            src={restaurant.photo}
            alt={restaurant.name}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Store className="w-5 h-5 text-primary" />
                  {restaurant.name}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <MapPin className="w-4 h-4 mr-1" />
                  {restaurant.address}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-1" />
                {t('review.edit')}
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(review.createdAt).toLocaleDateString(
                  language === 'ja' ? 'ja-JP' : 'vi-VN'
                )}
                {review.isEdited && (
                  <span className="ml-2 text-xs">({t('review.edited')})</span>
                )}
              </div>
            </div>

            <p className="text-foreground leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderDishReview = (review: Review) => {
    const dish = menusData.find((m) => m.id === review.targetId);
    const restaurant = getRestaurantForDish(review.targetId);
    if (!dish || !restaurant) return null;

    return (
      <div
        key={review.id}
        className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => handleNavigateToRestaurant(restaurant.id)}
      >
        <div className="flex gap-4">
          <img
            src={dish.photo}
            alt={getDishName(dish.id)}
            className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                  {getDishName(dish.id)}
                </h3>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Store className="w-4 h-4 mr-1" />
                  {restaurant.name}
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit2 className="w-4 h-4 mr-1" />
                {t('review.edit')}
              </Button>
            </div>

            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < review.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(review.createdAt).toLocaleDateString(
                  language === 'ja' ? 'ja-JP' : 'vi-VN'
                )}
                {review.isEdited && (
                  <span className="ml-2 text-xs">({t('review.edited')})</span>
                )}
              </div>
            </div>

            <p className="text-foreground leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header
        location={t('location.yourLocation')}
        onRefreshLocation={() => {}}
        isLoadingLocation={false}
        isFallbackLocation={false}
      />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {t('myReviews.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('myReviews.subtitle', { count: reviews.length })}
          </p>
        </div>

        <Tabs defaultValue="restaurant" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger 
              value="restaurant"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Store className="w-4 h-4 mr-2" />
              {t('myReviews.restaurantReviews')} ({restaurantReviews.length})
            </TabsTrigger>
            <TabsTrigger 
              value="dish"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <UtensilsCrossed className="w-4 h-4 mr-2" />
              {t('myReviews.dishReviews')} ({dishReviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="restaurant" className="space-y-4">
            {restaurantReviews.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-lg">
                <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  {t('myReviews.noRestaurantReviews')}
                </p>
              </div>
            ) : (
              restaurantReviews.map((review) => renderRestaurantReview(review))
            )}
          </TabsContent>

          <TabsContent value="dish" className="space-y-4">
            {dishReviews.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-lg">
                <UtensilsCrossed className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg text-muted-foreground">
                  {t('myReviews.noDishReviews')}
                </p>
              </div>
            ) : (
              dishReviews.map((review) => renderDishReview(review))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyReviews;

