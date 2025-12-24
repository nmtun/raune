import { useMemo, useEffect, useState } from "react";
import restaurantsData from "@/data/restaurants.json";
import menusDataDefault from "@/data/menus.json";
import accountsData from "@/data/accounts.json";
import { calculateDistance } from "@/utils/distance";
import { getCurrentAccountFromSession } from "@/utils/profileUtils";

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
  name: string | { vi: string; ja: string };
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

export function useRecommendations(
  userLat: number,
  userLng: number,
  maxDistance: number = MAX_DISTANCE_KM
) {
  // Get current user from session or fallback to first account
  const session = getCurrentAccountFromSession();
  const userId = session?.userId || 1;
  const user = accountsData.find((acc) => acc.id === userId) || accountsData[0];

  const [menusData, setMenusData] = useState<Menu[]>([]);

  // Load dishes from localStorage or use default data
  useEffect(() => {
    const savedDishes = localStorage.getItem("dishes");
    if (savedDishes) {
      try {
        const parsed = JSON.parse(savedDishes);
        if (Array.isArray(parsed)) {
          setMenusData(parsed);
        } else {
          setMenusData(menusDataDefault as Menu[]);
        }
      } catch (error) {
        console.error("Error parsing dishes:", error);
        setMenusData(menusDataDefault as Menu[]);
      }
    } else {
      setMenusData(menusDataDefault as Menu[]);
    }
  }, []);

  const recommendedDishes = useMemo(() => {
    const restaurants = restaurantsData as Restaurant[];
    const menus = menusData;

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
      .filter(
        (item): item is RecommendationScore & { menu: Menu } =>
          item !== null && item.menu !== undefined
      )
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
  }, [userLat, userLng, maxDistance, menusData]);

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
