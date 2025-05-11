import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Apple, Beef, Carrot, UserCheck as Cheese, DumbbellIcon as DumbellIcon, Egg, Fish, Flame, Salad, Scale, UtensilsCrossed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DietPlan } from '@/types';

// Pre-defined diet plans
const dietPlanTemplates = [
  {
    name: "Weight Loss Plan",
    description: "A calorie-deficit plan designed for sustainable weight loss.",
    type: "weight-loss",
    duration: 30,
    dailyCalories: 1800,
    macros: { protein: 40, carbs: 30, fat: 30 },
    image: "https://images.pexels.com/photos/216951/pexels-photo-216951.jpeg",
  },
  {
    name: "Muscle Building",
    description: "High protein diet to support muscle growth and recovery.",
    type: "muscle-gain",
    duration: 60,
    dailyCalories: 2800,
    macros: { protein: 50, carbs: 30, fat: 20 },
    image: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg",
  },
  {
    name: "Balanced Nutrition",
    description: "A well-balanced diet for overall health and maintenance.",
    type: "maintenance",
    duration: 90,
    dailyCalories: 2200,
    macros: { protein: 30, carbs: 40, fat: 30 },
    image: "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg",
  },
  {
    name: "Vegetarian Plan",
    description: "Plant-based nutrition without meat products.",
    type: "vegetarian",
    duration: 30,
    dailyCalories: 2000,
    macros: { protein: 25, carbs: 50, fat: 25 },
    image: "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg",
  },
  {
    name: "Keto Diet",
    description: "Low-carb, high-fat diet to promote ketosis.",
    type: "custom",
    duration: 30,
    dailyCalories: 1900,
    macros: { protein: 30, carbs: 10, fat: 60 },
    image: "https://images.pexels.com/photos/769289/pexels-photo-769289.jpeg",
  },
  {
    name: "Low-Carb Plan",
    description: "Reduced carbohydrate intake for blood sugar management.",
    type: "custom",
    duration: 60,
    dailyCalories: 2000,
    macros: { protein: 35, carbs: 25, fat: 40 },
    image: "https://images.pexels.com/photos/8844888/pexels-photo-8844888.jpeg",
  },
];

export default function DietPlannerPage() {
  const { isAuthenticated, user } = useAuth();
  const { mealPlans, createMealPlan } = useMealPlan();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [userDietPlans, setUserDietPlans] = useState<DietPlan[]>(() => {
    if (!user) return [];
    
    // Load from localStorage
    const storedPlans = localStorage.getItem(`culinary_diet_plans_${user.id}`);
    if (storedPlans) {
      try {
        return JSON.parse(storedPlans);
      } catch (error) {
        console.error('Error parsing diet plans:', error);
        return [];
      }
    }
    return [];
  });
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlan, setNewPlan] = useState<Omit<DietPlan, 'id' | 'userId'>>({
    name: "",
    description: "",
    type: "custom",
    duration: 30,
    dailyCalories: 2000,
    macros: {
      protein: 30,
      carbs: 40,
      fat: 30,
    },
  });

  const saveDietPlan = (plan: DietPlan) => {
    if (!user) return;
    
    setUserDietPlans((prev) => {
      const updated = [...prev, plan];
      localStorage.setItem(`culinary_diet_plans_${user.id}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleCreatePlan = () => {
    if (!user || !isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a diet plan",
        variant: "destructive",
      });
      return;
    }
    
    if (!newPlan.name.trim()) {
      toast({
        title: "Plan name required",
        description: "Please enter a name for your diet plan",
        variant: "destructive",
      });
      return;
    }
    
    // Create a meal plan to go with the diet plan
    const mealPlan = createMealPlan(`${newPlan.name} Meals`, `Meal plan for ${newPlan.name} diet`);
    
    const dietPlan: DietPlan = {
      ...newPlan,
      id: Date.now().toString(),
      userId: user.id,
      mealPlanId: mealPlan.id
    };
    
    saveDietPlan(dietPlan);
    
    toast({
      title: "Diet plan created",
      description: "Your new diet plan has been created successfully",
    });
    
    setIsCreateDialogOpen(false);
  };
  
  const handleApplyTemplate = (template: typeof dietPlanTemplates[0]) => {
    setNewPlan({
      name: template.name,
      description: template.description,
      type: template.type as any,
      duration: template.duration,
      dailyCalories: template.dailyCalories,
      macros: template.macros,
    });
    
    setIsCreateDialogOpen(true);
  };

  const handleDeletePlan = (planId: string) => {
    if (!user) return;
    
    setUserDietPlans((prev) => {
      const updated = prev.filter((plan) => plan.id !== planId);
      localStorage.setItem(`culinary_diet_plans_${user.id}`, JSON.stringify(updated));
      return updated;
    });
    
    toast({
      title: "Diet plan deleted",
      description: "Your diet plan has been deleted",
    });
  };

  // Macro pie chart component (simplified version)
  const MacroPieChart = ({ protein, carbs, fat }: { protein: number; carbs: number; fat: number }) => {
    const calculateDegrees = (percentage: number) => (percentage / 100) * 360;
    
    const proteinDegrees = calculateDegrees(protein);
    const carbsDegrees = calculateDegrees(carbs);
    // Fat takes the remainder
    
    return (
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 rounded-full overflow-hidden">
          <div className="absolute inset-0" style={{ 
            background: `conic-gradient(
              hsl(var(--primary)) 0deg ${proteinDegrees}deg, 
              hsl(var(--chart-2)) ${proteinDegrees}deg ${proteinDegrees + carbsDegrees}deg, 
              hsl(var(--chart-4)) ${proteinDegrees + carbsDegrees}deg 360deg
            )` 
          }} />
        </div>
        
        {/* Center white circle for donut effect */}
        <div className="absolute inset-0 m-auto w-12 h-12 bg-background rounded-full flex items-center justify-center text-xs font-medium">
          Macros
        </div>
      </div>
    );
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center py-20">
          <h1 className="text-3xl font-bold mb-4">Diet Planner</h1>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            You need to be logged in to create and manage diet plans.
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
          <h1 className="text-3xl font-bold mb-4">Diet Planner</h1>
          <p className="text-muted-foreground max-w-3xl">
            Create personalized diet plans to meet your nutritional goals. Choose from our templates or customize your own.
          </p>
        </div>
        
        {/* Diet Templates */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <UtensilsCrossed className="mr-2 h-6 w-6 text-primary" />
            Diet Plan Templates
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dietPlanTemplates.map((template, index) => (
              <Card key={index} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 overflow-hidden">
                  <img 
                    src={template.image} 
                    alt={template.name} 
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="flex items-center">
                      <Flame className="mr-1 h-3 w-3" />
                      {template.dailyCalories} cal/day
                    </Badge>
                    <Badge variant="outline" className="flex items-center">
                      <Activity className="mr-1 h-3 w-3" />
                      {template.duration} days
                    </Badge>
                    {template.type === "weight-loss" && (
                      <Badge variant="outline" className="flex items-center">
                        <Scale className="mr-1 h-3 w-3" />
                        Weight Loss
                      </Badge>
                    )}
                    {template.type === "muscle-gain" && (
                      <Badge variant="outline" className="flex items-center">
                        <DumbellIcon className="mr-1 h-3 w-3" />
                        Muscle Gain
                      </Badge>
                    )}
                    {template.type === "vegetarian" && (
                      <Badge variant="outline" className="flex items-center">
                        <Salad className="mr-1 h-3 w-3" />
                        Vegetarian
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Egg className="h-3 w-3" />
                        <span>Protein: {template.macros.protein}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Apple className="h-3 w-3" />
                        <span>Carbs: {template.macros.carbs}%</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Cheese className="h-3 w-3" />
                        <span>Fat: {template.macros.fat}%</span>
                      </div>
                    </div>
                    
                    <MacroPieChart 
                      protein={template.macros.protein} 
                      carbs={template.macros.carbs} 
                      fat={template.macros.fat} 
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => handleApplyTemplate(template)}
                  >
                    Use This Template
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
        
        {/* User Diet Plans */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold flex items-center">
              <Activity className="mr-2 h-6 w-6 text-primary" />
              Your Diet Plans
            </h2>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Custom Plan
            </Button>
          </div>
          
          {userDietPlans.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/30">
              <Salad className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">
                No diet plans yet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create your first diet plan by selecting a template or customizing your own.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                Create Custom Plan
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userDietPlans.map((plan) => (
                <Card key={plan.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle>{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge variant="outline" className="flex items-center">
                        <Flame className="mr-1 h-3 w-3" />
                        {plan.dailyCalories} cal/day
                      </Badge>
                      <Badge variant="outline" className="flex items-center">
                        <Activity className="mr-1 h-3 w-3" />
                        {plan.duration} days
                      </Badge>
                      {plan.type === "weight-loss" && (
                        <Badge variant="outline" className="flex items-center">
                          <Scale className="mr-1 h-3 w-3" />
                          Weight Loss
                        </Badge>
                      )}
                      {plan.type === "muscle-gain" && (
                        <Badge variant="outline" className="flex items-center">
                          <DumbellIcon className="mr-1 h-3 w-3" />
                          Muscle Gain
                        </Badge>
                      )}
                      {plan.type === "vegetarian" && (
                        <Badge variant="outline" className="flex items-center">
                          <Salad className="mr-1 h-3 w-3" />
                          Vegetarian
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Egg className="h-3 w-3" />
                          <span>Protein: {plan.macros.protein}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Apple className="h-3 w-3" />
                          <span>Carbs: {plan.macros.carbs}%</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Cheese className="h-3 w-3" />
                          <span>Fat: {plan.macros.fat}%</span>
                        </div>
                      </div>
                      
                      <MacroPieChart 
                        protein={plan.macros.protein} 
                        carbs={plan.macros.carbs} 
                        fat={plan.macros.fat} 
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="ghost" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      Delete
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        // Navigate to meal plan if one exists
                        if (plan.mealPlanId) {
                          navigate('/meal-planner');
                        } else {
                          toast({
                            title: "No meal plan linked",
                            description: "This diet plan doesn't have an associated meal plan.",
                          });
                        }
                      }}
                    >
                      View Meal Plan
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
      
      {/* Create Diet Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Custom Diet Plan</DialogTitle>
            <DialogDescription>
              Customize your diet plan to meet your specific needs and goals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Plan Name
              </label>
              <Input
                id="name"
                value={newPlan.name}
                onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                placeholder="My Custom Diet Plan"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Input
                id="description"
                value={newPlan.description}
                onChange={(e) => setNewPlan({...newPlan, description: e.target.value})}
                placeholder="A custom diet plan for my specific needs"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">
                Plan Type
              </label>
              <Select
                value={newPlan.type}
                onValueChange={(value) => setNewPlan({...newPlan, type: value as any})}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select plan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weight-loss">Weight Loss</SelectItem>
                  <SelectItem value="muscle-gain">Muscle Gain</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="duration" className="text-sm font-medium">
                Duration (days): {newPlan.duration}
              </label>
              <Slider
                id="duration"
                value={[newPlan.duration]}
                min={7}
                max={90}
                step={1}
                onValueChange={(value) => setNewPlan({...newPlan, duration: value[0]})}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="calories" className="text-sm font-medium">
                Daily Calories: {newPlan.dailyCalories}
              </label>
              <Slider
                id="calories"
                value={[newPlan.dailyCalories]}
                min={1200}
                max={3500}
                step={50}
                onValueChange={(value) => setNewPlan({...newPlan, dailyCalories: value[0]})}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Macronutrient Ratio</h4>
              
              <div className="grid gap-2">
                <label className="text-xs flex justify-between">
                  <span>Protein: {newPlan.macros.protein}%</span>
                </label>
                <Slider
                  value={[newPlan.macros.protein]}
                  min={10}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    const protein = value[0];
                    // Adjust carbs and fat proportionally
                    const remaining = 100 - protein;
                    const ratio = newPlan.macros.carbs / (newPlan.macros.carbs + newPlan.macros.fat);
                    const carbs = Math.round(remaining * ratio);
                    const fat = 100 - protein - carbs;
                    
                    setNewPlan({
                      ...newPlan,
                      macros: { protein, carbs, fat }
                    });
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-xs flex justify-between">
                  <span>Carbs: {newPlan.macros.carbs}%</span>
                </label>
                <Slider
                  value={[newPlan.macros.carbs]}
                  min={10}
                  max={70}
                  step={5}
                  onValueChange={(value) => {
                    const carbs = value[0];
                    // Adjust protein and fat to maintain 100% total
                    const remaining = 100 - carbs;
                    const ratio = newPlan.macros.protein / (newPlan.macros.protein + newPlan.macros.fat);
                    const protein = Math.round(remaining * ratio);
                    const fat = 100 - carbs - protein;
                    
                    setNewPlan({
                      ...newPlan,
                      macros: { protein, carbs, fat }
                    });
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <label className="text-xs flex justify-between">
                  <span>Fat: {newPlan.macros.fat}%</span>
                </label>
                <Slider
                  value={[newPlan.macros.fat]}
                  min={10}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    const fat = value[0];
                    // Adjust protein and carbs to maintain 100% total
                    const remaining = 100 - fat;
                    const ratio = newPlan.macros.protein / (newPlan.macros.protein + newPlan.macros.carbs);
                    const protein = Math.round(remaining * ratio);
                    const carbs = 100 - fat - protein;
                    
                    setNewPlan({
                      ...newPlan,
                      macros: { protein, carbs, fat }
                    });
                  }}
                />
              </div>
              
              <div className="flex justify-center mt-4">
                <MacroPieChart 
                  protein={newPlan.macros.protein} 
                  carbs={newPlan.macros.carbs} 
                  fat={newPlan.macros.fat} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}