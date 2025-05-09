import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Recipe } from '@/types';
import { getRecipesByCategory, getCategories, searchRecipes } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import RecipeGrid from '@/components/recipes/RecipeGrid';

export default function RecipesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('q');
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>(categoryParam || 'All');
  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories();
        const categoryNames = categoriesData.map(cat => cat.name);
        setCategories(['All', ...categoryNames]);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        let data: Recipe[] = [];
        
        if (queryParam) {
          // If there's a search query
          data = await searchRecipes(queryParam);
        } else if (categoryParam && categoryParam !== 'All') {
          // If there's a category filter
          data = await getRecipesByCategory(categoryParam);
        } else {
          // Default to showing first category
          const firstCategory = categories.length > 1 ? categories[1] : 'Beef';
          data = await getRecipesByCategory(firstCategory);
        }
        
        setRecipes(data);
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (categories.length > 0) {
      fetchRecipes();
    }
  }, [queryParam, categoryParam, categories]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    if (category === 'All') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', category);
    }
    searchParams.delete('q');
    setSearchParams(searchParams);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchParams.set('q', searchQuery);
      searchParams.delete('category');
      setSearchParams(searchParams);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Recipes</h1>
          <p className="text-muted-foreground max-w-3xl">
            Explore our collection of delicious recipes from around the world. Filter by category or search for something specific.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="py-4 mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                aria-label="Search"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <Button type="submit">Search</Button>
          </form>
          
          {/* Categories */}
          {categories.length > 0 ? (
            <Tabs 
              defaultValue={activeCategory} 
              value={activeCategory}
              onValueChange={handleCategoryChange}
              className="w-full"
            >
              <TabsList className="flex flex-wrap h-auto mb-4">
                {categories.map((category) => (
                  <TabsTrigger 
                    key={category} 
                    value={category}
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category} className="mt-6">
                  <RecipeGrid recipes={recipes} isLoading={isLoading} />
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <div className="flex overflow-x-auto py-2 space-x-2">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-md" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}