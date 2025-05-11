import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import RecipeGrid from '@/components/recipes/RecipeGrid';

export default function FavoritesPage() {
  const { isAuthenticated } = useAuth();
  const { favorites } = useFavorites();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center py-20">
          <h1 className="text-3xl font-bold mb-4">Favorites</h1>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            You need to be logged in to view your favorite recipes.
          </p>
          <div className="flex gap-4">
            <Button onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button variant="outline" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Heart className="h-8 w-8 text-primary" />
            My Favorites
          </h1>
          <p className="text-muted-foreground max-w-3xl">
            Your collection of saved recipes for easy access.
          </p>
        </div>
        
        {/* Favorites Grid */}
        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start exploring recipes and save your favorites to build your collection.
            </p>
            <Button onClick={() => navigate('/recipes')}>Browse Recipes</Button>
          </div>
        ) : (
          <RecipeGrid recipes={favorites} />
        )}
      </div>
    </div>
  );
}