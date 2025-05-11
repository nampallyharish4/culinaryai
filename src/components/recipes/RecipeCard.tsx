import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Recipe } from '@/types';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface RecipeCardProps {
  recipe: Recipe;
  className?: string;
}

export default function RecipeCard({ recipe, className }: RecipeCardProps) {
  const { isAuthenticated } = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const [isLoaded, setIsLoaded] = useState(false);
  const isFav = isFavorite(recipe.id);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isFav) {
      removeFavorite(recipe.id);
    } else {
      addFavorite(recipe);
    }
  };

  return (
    <Link 
      to={`/recipe/${recipe.id}`}
      className={cn(
        "group relative overflow-hidden rounded-lg bg-background border shadow-sm transition-all duration-300 hover:shadow-md",
        className
      )}
    >
      {/* Image Container */}
      <div className="aspect-square overflow-hidden">
        <div className="relative h-full w-full">
          {/* Skeleton loader */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          
          <img
            src={recipe.image}
            alt={recipe.name}
            className={cn(
              "h-full w-full object-cover transition-all duration-500 group-hover:scale-105",
              isLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setIsLoaded(true)}
          />
          
          {/* Category badge */}
          {recipe.category && (
            <Badge 
              className="absolute top-2 left-2 bg-background/80 text-foreground backdrop-blur-sm"
              variant="outline"
            >
              {recipe.category}
            </Badge>
          )}
          
          {/* Favorite button */}
          {isAuthenticated && (
            <button
              onClick={toggleFavorite}
              className={cn(
                "absolute top-2 right-2 p-2 rounded-full transition-all duration-300",
                isFav ? "bg-primary text-primary-foreground" : "bg-background/80 text-foreground hover:bg-background/90 backdrop-blur-sm"
              )}
              aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart 
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  isFav ? "fill-current" : "fill-none",
                  "group-hover:scale-110"
                )} 
              />
            </button>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {recipe.name}
        </h3>
        
        <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
          {recipe.area && <span>{recipe.area}</span>}
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {recipe.tags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{recipe.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Overlay for hover effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Link>
  );
}