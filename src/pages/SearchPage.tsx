import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRecipes } from '@/lib/api';
import { Recipe } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import RecipeGrid from '@/components/recipes/RecipeGrid';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) {
        setRecipes([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        const data = await searchRecipes(query);
        setRecipes(data);
      } catch (err) {
        console.error('Error searching recipes:', err);
        setError('Failed to search recipes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  return (
    <div className="min-h-screen pt-20 pb-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold mb-4 flex items-center gap-2">
            <Search className="h-8 w-8 text-primary" />
            Search Results
          </h1>
          <p className="text-muted-foreground">
            {query ? (
              <>
                Showing results for <span className="font-medium">"{query}"</span>
              </>
            ) : (
              'Enter a search term to find recipes'
            )}
          </p>
        </div>
        
        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">{error}</p>
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-medium mb-2">No results found</h2>
            <p className="text-muted-foreground">
              {query ? (
                `No recipes found matching "${query}". Try another search term.`
              ) : (
                'Enter a search term to find recipes'
              )}
            </p>
          </div>
        ) : (
          <RecipeGrid recipes={recipes} />
        )}
      </div>
    </div>
  );
}