import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getRandomMeal, getRecipesByCategory } from '@/lib/api';
import { Recipe } from '@/types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChefHat, ArrowRight } from 'lucide-react';
import RecipeGrid from '@/components/recipes/RecipeGrid';
import CategoryList from '@/components/recipes/CategoryList';

export default function HomePage() {
  const [featuredRecipe, setFeaturedRecipe] = useState<Recipe | null>(null);
  const [popularRecipes, setPopularRecipes] = useState<Recipe[]>([]);
  const [dessertRecipes, setDessertRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Featured recipe (random meal)
        const randomMeal = await getRandomMeal();
        if (randomMeal) {
          setFeaturedRecipe(randomMeal);
        }
        
        // Popular recipes (using Chicken category as an example)
        const chicken = await getRecipesByCategory('Chicken');
        setPopularRecipes(chicken.slice(0, 8));
        
        // Dessert recipes
        const desserts = await getRecipesByCategory('Dessert');
        setDessertRecipes(desserts.slice(0, 4));
      } catch (error) {
        console.error('Error fetching home page data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {isLoading || !featuredRecipe ? (
            <div className="w-full h-full bg-muted animate-pulse" />
          ) : (
            <img
              src={featuredRecipe.image}
              alt={featuredRecipe.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Discover Delicious Recipes
            </h1>
            <p className="text-lg md:text-xl mb-8 text-muted-foreground">
              Explore thousands of recipes, create meal plans, and organize your diet with our AI-powered culinary companion.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/recipes">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Recipes
                </Button>
              </Link>
              <Link to="/meal-planner">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Create Meal Plan
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Categories</h2>
            <Link to="/recipes" className="text-primary flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <CategoryList />
        </div>
      </section>
      
      {/* Popular Recipes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Popular Recipes</h2>
            <Link to="/recipes" className="text-primary flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <RecipeGrid recipes={popularRecipes} isLoading={isLoading} />
        </div>
      </section>
      
      {/* Featured Recipe Section */}
      {featuredRecipe && !isLoading && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8">Featured Recipe</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative h-[400px] rounded-lg overflow-hidden">
                <img
                  src={featuredRecipe.image}
                  alt={featuredRecipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <ChefHat className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-primary">
                    {featuredRecipe.category || "Featured Recipe"}
                  </span>
                </div>
                
                <h3 className="text-3xl font-bold mb-4">{featuredRecipe.name}</h3>
                
                {featuredRecipe.area && (
                  <p className="text-muted-foreground mb-2">
                    <span className="font-medium">Cuisine:</span> {featuredRecipe.area}
                  </p>
                )}
                
                {featuredRecipe.instructions && (
                  <p className="text-muted-foreground mb-6 line-clamp-4">
                    {featuredRecipe.instructions}
                  </p>
                )}
                
                <Link to={`/recipe/${featuredRecipe.id}`}>
                  <Button className="w-full sm:w-auto">
                    View Recipe
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}
      
      {/* Dessert Recipes Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold">Sweet Treats</h2>
            <Link to="/recipes?category=Dessert" className="text-primary flex items-center gap-1 hover:underline">
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          
          <RecipeGrid recipes={dessertRecipes} isLoading={isLoading} />
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Planning Your Meals Today
          </h2>
          <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Create personalized meal plans, explore diet options, and save your favorite recipes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Sign Up Now
              </Button>
            </Link>
            <Link to="/meal-planner">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground/30 hover:bg-primary-foreground/10">
                Try Meal Planner
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}