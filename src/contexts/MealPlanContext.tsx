import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { MealPlan, MealPlanDay, MealItem } from '@/types';
import { useAuth } from './AuthContext';

interface MealPlanContextType {
  mealPlans: MealPlan[];
  activeMealPlan: MealPlan | null;
  createMealPlan: (name: string, description?: string) => MealPlan;
  updateMealPlan: (mealPlan: MealPlan) => void;
  deleteMealPlan: (id: string) => void;
  setActiveMealPlan: (id: string) => void;
  addMealToDay: (dayId: string, meal: Omit<MealItem, 'id'>) => void;
  removeMealFromDay: (dayId: string, mealId: string) => void;
}

const MealPlanContext = createContext<MealPlanContextType | undefined>(undefined);

interface MealPlanProviderProps {
  children: ReactNode;
}

export function MealPlanProvider({ children }: MealPlanProviderProps) {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [activeMealPlan, setActiveMealPlan] = useState<MealPlan | null>(null);
  const { user } = useAuth();

  // Load meal plans from localStorage when the component mounts
  useEffect(() => {
    if (user) {
      const storedMealPlans = localStorage.getItem(`culinary_meal_plans_${user.id}`);
      if (storedMealPlans) {
        try {
          const parsedMealPlans = JSON.parse(storedMealPlans);
          setMealPlans(parsedMealPlans);
          
          // Set the first meal plan as active if there's no active plan
          if (parsedMealPlans.length > 0 && !activeMealPlan) {
            setActiveMealPlan(parsedMealPlans[0]);
          }
        } catch (error) {
          console.error('Error parsing meal plans:', error);
          setMealPlans([]);
        }
      }
    } else {
      setMealPlans([]);
      setActiveMealPlan(null);
    }
  }, [user]);

  // Save meal plans to localStorage whenever they change
  useEffect(() => {
    if (user) {
      localStorage.setItem(`culinary_meal_plans_${user.id}`, JSON.stringify(mealPlans));
    }
  }, [mealPlans, user]);

  const createMealPlan = (name: string, description?: string): MealPlan => {
    if (!user) {
      throw new Error('User must be logged in to create a meal plan');
    }
    
    const days = [
      { id: '1', name: 'Monday', meals: [] },
      { id: '2', name: 'Tuesday', meals: [] },
      { id: '3', name: 'Wednesday', meals: [] },
      { id: '4', name: 'Thursday', meals: [] },
      { id: '5', name: 'Friday', meals: [] },
      { id: '6', name: 'Saturday', meals: [] },
      { id: '7', name: 'Sunday', meals: [] },
    ];
    
    const newMealPlan: MealPlan = {
      id: Date.now().toString(),
      name,
      description,
      days,
      userId: user.id,
    };
    
    setMealPlans((prev) => [...prev, newMealPlan]);
    setActiveMealPlan(newMealPlan);
    
    return newMealPlan;
  };

  const updateMealPlan = (updatedMealPlan: MealPlan) => {
    setMealPlans((prev) =>
      prev.map((plan) => (plan.id === updatedMealPlan.id ? updatedMealPlan : plan))
    );
    
    if (activeMealPlan?.id === updatedMealPlan.id) {
      setActiveMealPlan(updatedMealPlan);
    }
  };

  const deleteMealPlan = (id: string) => {
    setMealPlans((prev) => prev.filter((plan) => plan.id !== id));
    
    if (activeMealPlan?.id === id) {
      setActiveMealPlan(mealPlans.find((plan) => plan.id !== id) || null);
    }
  };

  const setActivePlan = (id: string) => {
    const plan = mealPlans.find((plan) => plan.id === id);
    if (plan) {
      setActiveMealPlan(plan);
    }
  };

  const addMealToDay = (dayId: string, meal: Omit<MealItem, 'id'>) => {
    if (!activeMealPlan) return;
    
    const newMeal: MealItem = {
      ...meal,
      id: Date.now().toString(),
    };
    
    const updatedDays = activeMealPlan.days.map((day) =>
      day.id === dayId
        ? { ...day, meals: [...day.meals, newMeal] }
        : day
    );
    
    const updatedMealPlan = {
      ...activeMealPlan,
      days: updatedDays,
    };
    
    updateMealPlan(updatedMealPlan);
  };

  const removeMealFromDay = (dayId: string, mealId: string) => {
    if (!activeMealPlan) return;
    
    const updatedDays = activeMealPlan.days.map((day) =>
      day.id === dayId
        ? { ...day, meals: day.meals.filter((meal) => meal.id !== mealId) }
        : day
    );
    
    const updatedMealPlan = {
      ...activeMealPlan,
      days: updatedDays,
    };
    
    updateMealPlan(updatedMealPlan);
  };

  return (
    <MealPlanContext.Provider
      value={{
        mealPlans,
        activeMealPlan,
        createMealPlan,
        updateMealPlan,
        deleteMealPlan,
        setActiveMealPlan: setActivePlan,
        addMealToDay,
        removeMealFromDay,
      }}
    >
      {children}
    </MealPlanContext.Provider>
  );
}

export function useMealPlan() {
  const context = useContext(MealPlanContext);
  if (context === undefined) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
}