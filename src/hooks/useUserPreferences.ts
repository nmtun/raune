import { useState, useEffect } from 'react';
import { getCurrentAccountFromSession } from '@/utils/profileUtils';

export interface UserPreferences {
  foodPreferences: string[];
  timestamp: string;
  userId?: number; // Thêm userId để track
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  // Get current user ID
  const getCurrentUserId = () => {
    const session = getCurrentAccountFromSession();
    return session?.userId || null;
  };

  // Get storage key based on userId
  const getStorageKey = (userId: number | null) => {
    if (!userId) return 'userFoodPreferences';
    return `userFoodPreferences_${userId}`;
  };

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const userId = getCurrentUserId();
      const storageKey = getStorageKey(userId);
      let stored = localStorage.getItem(storageKey);
      
      // Migration: Nếu không tìm thấy với key mới, thử key cũ và migrate
      if (!stored && userId) {
        const oldKey = 'userFoodPreferences';
        const oldStored = localStorage.getItem(oldKey);
        if (oldStored) {
          try {
            const oldPrefs = JSON.parse(oldStored);
            // Di chuyển sang key mới và gắn userId
            const migratedPrefs = {
              ...oldPrefs,
              userId: userId
            };
            localStorage.setItem(storageKey, JSON.stringify(migratedPrefs));
            stored = JSON.stringify(migratedPrefs);
            // Xóa key cũ sau khi migrate
            localStorage.removeItem(oldKey);
          } catch (error) {
            console.error('Error migrating preferences:', error);
          }
        }
      }
      
      if (stored) {
        const parsedPrefs = JSON.parse(stored) as UserPreferences;
        // Verify this belongs to current user
        if (!userId || parsedPrefs.userId === userId) {
          setPreferences(parsedPrefs);
        } else {
          setPreferences(null);
        }
      } else {
        setPreferences(null);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
      setPreferences(null);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = (foodPreferences: string[]) => {
    const userId = getCurrentUserId();
    if (!userId) {
      console.error('Cannot save preferences: User not logged in');
      return false;
    }

    const newPrefs: UserPreferences = {
      foodPreferences,
      timestamp: new Date().toISOString(),
      userId, // Store userId with preferences
    };
    
    try {
      const storageKey = getStorageKey(userId);
      localStorage.setItem(storageKey, JSON.stringify(newPrefs));
      setPreferences(newPrefs);
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  };

  const clearPreferences = () => {
    try {
      const userId = getCurrentUserId();
      const storageKey = getStorageKey(userId);
      localStorage.removeItem(storageKey);
      setPreferences(null);
      return true;
    } catch (error) {
      console.error('Error clearing user preferences:', error);
      return false;
    }
  };

  const hasPreferences = () => {
    const userId = getCurrentUserId();
    if (!userId) return false;
    return preferences !== null && 
           preferences.foodPreferences.length > 0 && 
           preferences.userId === userId;
  };

  const isPreferred = (tag: string) => {
    const userId = getCurrentUserId();
    if (!userId || !preferences || preferences.userId !== userId) {
      return false;
    }
    return preferences.foodPreferences.includes(tag);
  };

  return {
    preferences,
    loading,
    savePreferences,
    clearPreferences,
    hasPreferences,
    isPreferred,
    refreshPreferences: loadPreferences,
  };
};