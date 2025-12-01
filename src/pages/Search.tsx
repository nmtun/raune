import { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { RestaurantCard } from '@/components/RestaurantCard';
import { LocationMap } from '@/components/LocationMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGeolocation } from '@/hooks/useGeolocation';
import { calculateDistance, formatDistance } from '@/utils/distance';
import { flexibleMatch } from '@/utils/stringUtils';
import restaurantsData from '@/data/restaurants.json';
import menusData from '@/data/menus.json';
import { ArrowLeft, SlidersHorizontal, Map } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useGeolocation();
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get('category')?.split(',').filter(Boolean) || []
  );
  const [priceRanges, setPriceRanges] = useState<string[]>(
    searchParams.get('price')?.split(',').filter(Boolean) || []
  );
  const [maxDistance, setMaxDistance] = useState<number>(
    Number(searchParams.get('distance')) || 10
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const categories = ['All', 'Vietnamese', 'Asian', 'Western', 'Cafe', 'Fast Food'];

  const handleRefreshLocation = () => {
    location.refreshLocation();
  };

  const filteredRestaurants = useMemo(() => {
    let results = [...restaurantsData];

    // Apply search query with flexible Vietnamese accent matching
    if (searchQuery) {
      results = results.filter((r) => {
        // Kiểm tra tên nhà hàng, category, address, tags
        const restaurantMatch = 
          flexibleMatch(r.name, searchQuery) ||
          flexibleMatch(r.category, searchQuery) ||
          flexibleMatch(r.address, searchQuery) ||
          r.tags.some((tag) => flexibleMatch(tag, searchQuery));
        
        // Kiểm tra tên món ăn (cả tiếng Việt và tiếng Nhật)
        const dishMatch = menusData.some((d) => {
          if (d.restaurantId !== r.id) return false;
          
          const dishNameMatch = typeof d.name === 'string' 
            ? flexibleMatch(d.name, searchQuery)
            : (flexibleMatch(d.name.vi, searchQuery) || 
               flexibleMatch(d.name.ja, searchQuery) ||
               d.name.ja.includes(searchQuery));
          
          return dishNameMatch || flexibleMatch(d.category, searchQuery);
        });
        
        return restaurantMatch || dishMatch;
      });
    }

    // Apply category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes('All')) {
      results = results.filter((r) => selectedCategories.includes(r.category));
    }

    // Calculate distances and attach featured dishes
    const withDistance = results.map((r) => {
      const distance = calculateDistance(location.lat, location.lng, r.lat, r.lng);
      
      // Get dishes for this restaurant
      let dishes = menusData.filter((d) => d.restaurantId === r.id);
      
      // Filter dishes by search query if exists (with flexible matching)
      if (searchQuery) {
        const matchingDishes = dishes.filter((d) => {
          // Kiểm tra tên món ăn (hỗ trợ cả tiếng Việt và tiếng Nhật)
          const dishNameMatch = typeof d.name === 'string' 
            ? flexibleMatch(d.name, searchQuery)
            : (flexibleMatch(d.name.vi, searchQuery) || 
               flexibleMatch(d.name.ja, searchQuery) ||
               d.name.ja.includes(searchQuery)); // Thêm tìm kiếm trực tiếp cho tiếng Nhật
          
          return dishNameMatch || flexibleMatch(d.category, searchQuery);
        });
        // If there are matching dishes, show them; otherwise show top 3 dishes
        dishes = matchingDishes.length > 0 ? matchingDishes.slice(0, 3) : dishes.slice(0, 3);
      } else {
        // Show top 3 highest rated dishes
        dishes = dishes.sort((a, b) => b.rating - a.rating).slice(0, 3);
      }
      
      return {
        ...r,
        distance,
        dishes,
      };
    });

    // Apply distance filter
    const filteredByDistance = withDistance.filter((r) => r.distance <= maxDistance);

    // Apply sorting
    switch (sortBy) {
      case 'rating':
        filteredByDistance.sort((a, b) => b.rating - a.rating);
        break;
      case 'distance':
        filteredByDistance.sort((a, b) => a.distance - b.distance);
        break;
      case 'reviews':
        filteredByDistance.sort((a, b) => b.reviews - a.reviews);
        break;
    }

    return filteredByDistance;
  }, [searchQuery, selectedCategories, sortBy, maxDistance, location.lat, location.lng]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (sortBy !== 'rating') params.set('sort', sortBy);
    if (selectedCategories.length > 0) params.set('category', selectedCategories.join(','));
    setSearchParams(params);
  };

  const toggleCategory = (category: string) => {
    if (category === 'All') {
      setSelectedCategories([]);
    } else {
      setSelectedCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header 
        location={location.isFallback ? t('location.defaultLocation') : t('location.yourLocation')}
        onRefreshLocation={handleRefreshLocation}
        isLoadingLocation={location.loading}
        isFallbackLocation={location.isFallback}
      />

      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Back Button & Map Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('search.backHome')}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowMap(!showMap)}
          >
            <Map className="w-4 h-4 mr-2" />
            {showMap ? t('search.hideMap') : t('search.showMap')}
          </Button>
        </div>

        {/* Search & Filters Panel */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder={t('search.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">{t('search.searchButton')}</Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>

            {/* Filters */}
            <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
              {/* Sort and Distance */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">{t('search.sortBy')}</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rating">{t('sort.rating')}</SelectItem>
                      <SelectItem value="distance">{t('sort.distance')}</SelectItem>
                      <SelectItem value="reviews">{t('sort.reviews')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium mb-2 block">
                    {t('search.searchRadius', { radius: maxDistance })}
                  </Label>
                  <Select value={maxDistance.toString()} onValueChange={(v) => setMaxDistance(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">{t('distance.within3km')}</SelectItem>
                      <SelectItem value="5">{t('distance.within5km')}</SelectItem>
                      <SelectItem value="10">{t('distance.within10km')}</SelectItem>
                      <SelectItem value="20">{t('distance.within20km')}</SelectItem>
                      <SelectItem value="50">{t('distance.within50km')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Categories */}
              <div>
                <Label className="text-sm font-medium mb-2 block">{t('search.category')}</Label>
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => {
                    const isSelected =
                      category === 'All'
                        ? selectedCategories.length === 0
                        : selectedCategories.includes(category);
                    
                    const getCategoryName = (cat: string) => {
                      switch(cat) {
                        case 'All': return t('categories.all');
                        case 'Vietnamese': return t('categories.vietnamese');
                        case 'Asian': return t('categories.asian');
                        case 'Western': return t('categories.western');
                        case 'Cafe': return t('categories.cafe');
                        case 'Fast Food': return t('categories.fast food');
                        default: return cat;
                      }
                    };
                    
                    return (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background text-foreground border-border hover:border-primary'
                        }`}
                      >
                        {getCategoryName(category)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Map Section */}
        {showMap && (
          <div className="mb-6">
            <LocationMap
              userLat={location.lat}
              userLng={location.lng}
              restaurants={filteredRestaurants.map((r) => ({
                id: r.id,
                name: r.name,
                lat: r.lat,
                lng: r.lng,
                distance: r.distance,
              }))}
              onRefreshLocation={handleRefreshLocation}
              isLoadingLocation={location.loading}
            />
          </div>
        )}

        {/* Results */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              {t('search.restaurants', { count: filteredRestaurants.length })}
            </h2>
            {searchQuery && (
              <p className="text-sm text-muted-foreground">
                {t('search.searchFor', { query: searchQuery })}
              </p>
            )}
          </div>
          {location.isFallback && (
            <p className="text-sm text-yellow-600 mt-1">
              {t('location.fallbackNote')}
            </p>
          )}
          {searchQuery && filteredRestaurants.length > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {t('search.searchTip')}
            </p>
          )}
        </div>

        {filteredRestaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {t('search.noResults')}{' '}
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategories([]);
                  setMaxDistance(50);
                }}
                className="text-primary hover:underline"
              >
                {t('search.clearFilters')}
              </button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                address={restaurant.address}
                distance={formatDistance(restaurant.distance)}
                rating={restaurant.rating}
                reviews={restaurant.reviews}
                tags={restaurant.tags}
                photo={restaurant.photo}
                category={restaurant.category}
                dishes={restaurant.dishes}
              />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Search;
