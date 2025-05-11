import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getRecipeById } from '@/lib/api';
import { Recipe } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Heart, Clock, ChefHat, ArrowLeft, UtensilsCrossed, ExternalLink, Plus } from 'lucide-react';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { useAuth } from '@/contexts/AuthContext';

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();
  const { activeMealPlan, addMealToDay } = useMealPlan();

  useEffect(() => {
    if (!id) return;

    const fetchRecipe = async () => {
      try {
        setIsLoading(true);
        const data = await getRecipeById(id);
        setRecipe(data);
      } catch (error) {
        console.error('Error fetching recipe details:', error);
        toast({
          title: "Error",
          description: "Failed to load recipe. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, toast]);

  const toggleFavorite = () => {
    if (!recipe) return;
    
    if (isFavorite(recipe.id)) {
      removeFavorite(recipe.id);
      toast({
        title: "Removed from favorites",
        description: `${recipe.name} has been removed from your favorites.`,
      });
    } else {
      addFavorite(recipe);
      toast({
        title: "Added to favorites",
        description: `${recipe.name} has been added to your favorites.`,
      });
    }
  };

  const addToMealPlan = (mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    if (!recipe || !activeMealPlan) {
      toast({
        title: "No meal plan active",
        description: "Please create or select a meal plan first.",
        variant: "destructive",
      });
      return;
    }
    
    // For simplicity, adding to the first day (Monday)
    const dayId = activeMealPlan.days[0].id;
    
    addMealToDay(dayId, {
      type: mealType,
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeImage: recipe.image,
    });
    
    toast({
      title: "Added to meal plan",
      description: `${recipe.name} has been added to your meal plan as ${mealType}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <Link to="/recipes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Skeleton className="h-8 w-32" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Skeleton className="aspect-video rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 text-center py-20">
          <h1 className="text-2xl font-bold mb-4">Recipe Not Found</h1>
          <p className="text-muted-foreground mb-8">The recipe you're looking for doesn't exist or has been removed.</p>
          <Link to="/recipes">
            <Button>Browse Recipes</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Back button and categories */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
          <Link to="/recipes">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          
          {recipe.category && (
            <Badge variant="outline" className="rounded-full">
              {recipe.category}
            </Badge>
          )}
          
          {recipe.area && (
            <Badge variant="outline" className="rounded-full">
              {recipe.area}
            </Badge>
          )}
        </div>
        
        {/* Recipe Header */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Recipe Image */}
          <div className="relative rounded-lg overflow-hidden">
            <img 
              src={recipe.image} 
              alt={recipe.name} 
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Recipe Info */}
          <div className="space-y-6">
            <h1 className="text-3xl md:text-4xl font-bold">{recipe.name}</h1>
            
            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {isAuthenticated && (
                <Button
                  variant={isFavorite(recipe.id) ? "default" : "outline"}
                  className="gap-2"
                  onClick={toggleFavorite}
                >
                  <Heart className={isFavorite(recipe.id) ? "fill-current" : ""} size={16} />
                  {isFavorite(recipe.id) ? "Saved" : "Save"}
                </Button>
              )}
              
              {isAuthenticated && (
                <div className="relative group">
                  <Button variant="outline" className="gap-2">
                    <Plus size={16} />
                    Add to Meal Plan
                  </Button>
                  
                  <div className="absolute z-10 left-0 mt-2 w-40 bg-popover rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-2 space-y-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-left"
                        onClick={() => addToMealPlan('breakfast')}
                      >
                        Breakfast
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-left"
                        onClick={() => addToMealPlan('lunch')}
                      >
                        Lunch
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-left"
                        onClick={() => addToMealPlan('dinner')}
                      >
                        Dinner
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-left"
                        onClick={() => addToMealPlan('snack')}
                      >
                        Snack
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {recipe.youtube && (
                <a href={recipe.youtube} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="gap-2">
                    <ExternalLink size={16} />
                    Watch Video
                  </Button>
                </a>
              )}
            </div>
            
            {/* Ingredients */}
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Ingredients
              </h2>
              <ul className="space-y-2">
                {recipe.ingredients?.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>
                      <span className="font-medium">{item.measure}</span> {item.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <ChefHat className="h-6 w-6 text-primary" />
            Instructions
          </h2>
          
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            {recipe.instructions?.split('\r\n').filter(Boolean).map((step, index) => (
              <p key={index} className="mb-4">{step}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}