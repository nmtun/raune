import { useState, useEffect } from 'react';

export interface UserPreferences {
  foodPreferences: string[];
  timestamp: string;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('userFoodPreferences');
      if (stored) {
        const parsedPrefs = JSON.parse(stored) as UserPreferences;
        setPreferences(parsedPrefs);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = (foodPreferences: string[]) => {
    const newPrefs: UserPreferences = {
      foodPreferences,
      timestamp: new Date().toISOString(),
    };
    
    try {
      localStorage.setItem('userFoodPreferences', JSON.stringify(newPrefs));
      setPreferences(newPrefs);
      return true;
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  };

  const clearPreferences = () => {
    try {
      localStorage.removeItem('userFoodPreferences');
      setPreferences(null);
      return true;
    } catch (error) {
      console.error('Error clearing user preferences:', error);
      return false;
    }
  };

  const hasPreferences = () => {
    return preferences !== null && preferences.foodPreferences.length > 0;
  };

  const isPreferred = (tag: string) => {
    return preferences?.foodPreferences.includes(tag) || false;
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