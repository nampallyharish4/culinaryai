import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Recipe } from '@/types';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favorites: Recipe[];
  addFavorite: (recipe: Recipe) => void;
  removeFavorite: (recipeId: string) => void;
  isFavorite: (recipeId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const { user } = useAuth();

  // Load favorites from localStorage when the component mounts
  useEffect(() => {
    if (user) {
      const storedFavorites = localStorage.getItem(`culinary_favorites_${user.id}`);
      if (storedFavorites) {
        try {
          setFavorites(JSON.parse(storedFavorites));
        } catch (error) {
          console.error('Error parsing favorites:', error);
          setFavorites([]);
        }
      }
    } else {
      setFavorites([]);
    }
  }, [user]);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`culinary_favorites_${user.id}`, JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const addFavorite = (recipe: Recipe) => {
    setFavorites((prevFavorites) => {
      // Check if recipe is already in favorites
      if (prevFavorites.some((fav) => fav.id === recipe.id)) {
        return prevFavorites;
      }
      return [...prevFavorites, { ...recipe, isFavorite: true }];
    });
  };

  const removeFavorite = (recipeId: string) => {
    setFavorites((prevFavorites) => 
      prevFavorites.filter((recipe) => recipe.id !== recipeId)
    );
  };

  const isFavorite = (recipeId: string) => {
    return favorites.some((recipe) => recipe.id === recipeId);
  };

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}