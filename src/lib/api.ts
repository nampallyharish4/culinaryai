import { Recipe, Category, MealPlan } from '@/types';

const API_BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Fetches recipes by category
export async function getRecipesByCategory(category: string): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/filter.php?c=${category}`);
    const data = await response.json();
    
    if (!data.meals) return [];
    
    return data.meals.map((meal: any) => ({
      id: meal.idMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
      category,
      isFavorite: false,
    }));
  } catch (error) {
    console.error('Error fetching recipes by category:', error);
    return [];
  }
}

// Fetches recipe details by ID
export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/lookup.php?i=${id}`);
    const data = await response.json();
    
    if (!data.meals || data.meals.length === 0) return null;
    
    const meal = data.meals[0];
    
    // Extract ingredients and measurements
    const ingredients: { name: string; measure: string }[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient,
          measure: measure || '',
        });
      }
    }
    
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      instructions: meal.strInstructions,
      image: meal.strMealThumb,
      tags: meal.strTags ? meal.strTags.split(',') : [],
      youtube: meal.strYoutube,
      ingredients,
      isFavorite: false,
    };
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    return null;
  }
}

// Fetches all categories
export async function getCategories(): Promise<Category[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/categories.php`);
    const data = await response.json();
    
    if (!data.categories) return [];
    
    return data.categories.map((category: any) => ({
      id: category.idCategory,
      name: category.strCategory,
      image: category.strCategoryThumb,
      description: category.strCategoryDescription,
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

// Searches recipes by name
export async function searchRecipes(query: string): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/search.php?s=${query}`);
    const data = await response.json();
    
    if (!data.meals) return [];
    
    return data.meals.map((meal: any) => ({
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      image: meal.strMealThumb,
      isFavorite: false,
    }));
  } catch (error) {
    console.error('Error searching recipes:', error);
    return [];
  }
}

// Fetches random meal
export async function getRandomMeal(): Promise<Recipe | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/random.php`);
    const data = await response.json();
    
    if (!data.meals || data.meals.length === 0) return null;
    
    const meal = data.meals[0];
    
    // Extract ingredients and measurements
    const ingredients: { name: string; measure: string }[] = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      const measure = meal[`strMeasure${i}`];
      
      if (ingredient && ingredient.trim() !== '') {
        ingredients.push({
          name: ingredient,
          measure: measure || '',
        });
      }
    }
    
    return {
      id: meal.idMeal,
      name: meal.strMeal,
      category: meal.strCategory,
      area: meal.strArea,
      instructions: meal.strInstructions,
      image: meal.strMealThumb,
      tags: meal.strTags ? meal.strTags.split(',') : [],
      youtube: meal.strYoutube,
      ingredients,
      isFavorite: false,
    };
  } catch (error) {
    console.error('Error fetching random meal:', error);
    return null;
  }
}

// Fetches meals by area/cuisine
export async function getRecipesByArea(area: string): Promise<Recipe[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/filter.php?a=${area}`);
    const data = await response.json();
    
    if (!data.meals) return [];
    
    return data.meals.map((meal: any) => ({
      id: meal.idMeal,
      name: meal.strMeal,
      image: meal.strMealThumb,
      area,
      isFavorite: false,
    }));
  } catch (error) {
    console.error('Error fetching recipes by area:', error);
    return [];
  }
}

// Fetches all available areas/cuisines
export async function getAreas(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/list.php?a=list`);
    const data = await response.json();
    
    if (!data.meals) return [];
    
    return data.meals.map((item: any) => item.strArea);
  } catch (error) {
    console.error('Error fetching areas:', error);
    return [];
  }
}