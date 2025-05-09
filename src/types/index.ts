// User related types
export interface User {
  id: string;
  name: string;
  email: string;
}

// Recipe related types
export interface Recipe {
  id: string;
  name: string;
  category?: string;
  area?: string;
  instructions?: string;
  image: string;
  tags?: string[];
  youtube?: string;
  ingredients?: { name: string; measure: string }[];
  isFavorite: boolean;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  description: string;
}

// Meal planning related types
export interface MealPlan {
  id: string;
  name: string;
  description?: string;
  days: MealPlanDay[];
  userId: string;
}

export interface MealPlanDay {
  id: string;
  name: string; // e.g., "Monday", "Day 1"
  meals: MealItem[];
}

export interface MealItem {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  recipeName: string;
  recipeImage: string;
}

// Diet planning related types
export interface DietPlan {
  id: string;
  name: string;
  description: string;
  type: 'weight-loss' | 'muscle-gain' | 'maintenance' | 'vegetarian' | 'vegan' | 'custom';
  duration: number; // in days
  dailyCalories: number;
  macros: {
    protein: number; // percentage
    carbs: number; // percentage
    fat: number; // percentage
  };
  mealPlanId?: string;
  userId: string;
}

// Authentication related types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}