import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '@/lib/api';
import { Category } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
        {[...Array(6)].map((_, index) => (
          <div key={index} className="flex flex-col items-center">
            <Skeleton className="h-20 w-20 rounded-full" />
            <Skeleton className="h-4 w-16 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 mb-12">
      {categories.map((category) => (
        <Link
          key={category.id}
          to={`/recipes?category=${category.name}`}
          className="group flex flex-col items-center justify-center transition-all duration-300 hover:-translate-y-1"
        >
          <div className={cn(
            "relative h-20 w-20 rounded-full overflow-hidden border-2 border-transparent",
            "group-hover:border-primary transition-all duration-300",
            "shadow-sm group-hover:shadow-md"
          )}>
            <img
              src={category.image}
              alt={category.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
          <span className="mt-2 text-sm font-medium group-hover:text-primary transition-colors">
            {category.name}
          </span>
        </Link>
      ))}
    </div>
  );
}