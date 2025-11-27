import { useMemo } from 'react';
import restaurantsData from '@/data/restaurants.json';
import menusData from '@/data/menus.json';
import usersData from '@/data/users.json';
import { calculateDistance } from '@/utils/distance';

interface Restaurant {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  rating: number;
  reviews: number;
  tags: string[];
  photo: string;
}

interface Menu {
  id: number;
  restaurantId: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  reviews: number;
  photo: string;
}

interface RecommendationScore {
  restaurant: Restaurant;
  menu?: Menu;
  distance: number;
  score: number;
}

const MAX_DISTANCE_KM = 10;

export function useRecommendations(userLat: number, userLng: number, maxDistance: number = MAX_DISTANCE_KM) {
  const user = usersData[0]; // Mock logged-in user

  const recommendedDishes = useMemo(() => {
    const restaurants = restaurantsData as Restaurant[];
    const menus = menusData as Menu[];
    
    // Calculate scores for each menu item
    const scored: RecommendationScore[] = menus
      .map((menu) => {
        const restaurant = restaurants.find((r) => r.id === menu.restaurantId);
        if (!restaurant) return null;

        const distance = calculateDistance(
          userLat,
          userLng,
          restaurant.lat,
          restaurant.lng
        );

        // Skip if too far
        if (distance > maxDistance) return null;

        return {
          restaurant,
          menu,
          distance,
          score: 0, // Not used for sorting anymore
        };
      })
      .filter((item): item is RecommendationScore & { menu: Menu } => item !== null && item.menu !== undefined)
      .sort((a, b) => {
        // Sort by distance first (ascending)
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        // If distance is the same, sort by rating (descending)
        return (b.menu?.rating || 0) - (a.menu?.rating || 0);
      })
      .slice(0, 8);

    return scored;
  }, [userLat, userLng, maxDistance]);

  const recommendedRestaurants = useMemo(() => {
    const restaurants = restaurantsData as Restaurant[];
    
    const scored: RecommendationScore[] = restaurants
      .map((restaurant) => {
        const distance = calculateDistance(
          userLat,
          userLng,
          restaurant.lat,
          restaurant.lng
        );

        // Skip if too far
        if (distance > maxDistance) return null;

        return {
          restaurant,
          distance,
          score: 0, // Not used for sorting anymore
        };
      })
      .filter((item): item is RecommendationScore => item !== null)
      .sort((a, b) => {
        // Sort by distance first (ascending)
        if (a.distance !== b.distance) {
          return a.distance - b.distance;
        }
        // If distance is the same, sort by rating (descending)
        return b.restaurant.rating - a.restaurant.rating;
      })
      .slice(0, 7);

    return scored;
  }, [userLat, userLng, maxDistance]);

  return {
    dishes: recommendedDishes,
    restaurants: recommendedRestaurants,
  };
}
