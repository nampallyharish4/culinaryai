import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useMealPlan } from '@/contexts/MealPlanContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { PlusCircle, Trash2, Calendar, MoreHorizontal, FileText, Edit } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function MealPlannerPage() {
  const { isAuthenticated, user } = useAuth();
  const { mealPlans, activeMealPlan, createMealPlan, updateMealPlan, deleteMealPlan, setActiveMealPlan } = useMealPlan();
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDescription, setNewPlanDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreatePlan = () => {
    if (!newPlanName.trim()) {
      toast({
        title: "Plan name required",
        description: "Please enter a name for your meal plan.",
        variant: "destructive",
      });
      return;
    }
    
    createMealPlan(newPlanName, newPlanDescription);
    setNewPlanName('');
    setNewPlanDescription('');
    setIsCreateDialogOpen(false);
    
    toast({
      title: "Meal plan created",
      description: "Your new meal plan has been created successfully.",
    });
  };

  const handleSelectPlan = (planId: string) => {
    setActiveMealPlan(planId);
  };

  const handleDeletePlan = (planId: string) => {
    deleteMealPlan(planId);
    
    toast({
      title: "Meal plan deleted",
      description: "Your meal plan has been deleted.",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-20 pb-16 bg-background">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center py-20">
          <h1 className="text-3xl font-bold mb-4">Meal Planner</h1>
          <p className="text-muted-foreground text-center mb-8 max-w-md">
            You need to be logged in to create and manage meal plans.
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 py-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Meal Planner</h1>
            <p className="text-muted-foreground">
              Plan your meals for the week and keep track of your diet.
            </p>
          </div>
          
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="mt-4 sm:mt-0 gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            Create Meal Plan
          </Button>
        </div>
        
        {/* Meal Plans */}
        {mealPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-medium mb-2">No meal plans yet</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first meal plan to start organizing your weekly meals.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              Create Your First Meal Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Meal Plan Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {mealPlans.map((plan) => (
                <Card 
                  key={plan.id}
                  className={`transition-all duration-200 ${
                    activeMealPlan?.id === plan.id ? 'border-primary shadow-md' : ''
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription>
                          {plan.days.reduce((count, day) => count + day.meals.length, 0)} meals planned
                        </CardDescription>
                      </div>
                      {activeMealPlan?.id === plan.id && (
                        <Badge>Active</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description || 'No description provided.'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {plan.days.slice(0, 5).map((day) => (
                        <Badge key={day.id} variant="outline">
                          {day.name.substring(0, 3)}
                        </Badge>
                      ))}
                      {plan.days.length > 5 && (
                        <Badge variant="outline">+{plan.days.length - 5}</Badge>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeletePlan(plan.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                    <Button
                      variant={activeMealPlan?.id === plan.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSelectPlan(plan.id)}
                    >
                      {activeMealPlan?.id === plan.id ? 'View Plan' : 'Select Plan'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            {/* Active Meal Plan */}
            {activeMealPlan && (
              <div className="mt-10">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-primary" />
                  {activeMealPlan.name}
                </h2>
                
                <Tabs defaultValue="1" className="w-full">
                  <TabsList className="w-full max-w-full flex overflow-x-auto mb-6">
                    {activeMealPlan.days.map((day) => (
                      <TabsTrigger key={day.id} value={day.id} className="flex-1">
                        {day.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  {activeMealPlan.days.map((day) => (
                    <TabsContent key={day.id} value={day.id} className="pt-2">
                      {day.meals.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg bg-muted/30">
                          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No meals planned for {day.name}
                          </h3>
                          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                            Add meals by browsing recipes and clicking "Add to Meal Plan"
                          </p>
                          <Button onClick={() => navigate('/recipes')}>
                            Browse Recipes
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {['breakfast', 'lunch', 'dinner', 'snack'].map((mealType) => (
                            <div key={mealType} className="space-y-2">
                              <h3 className="font-medium capitalize">
                                {mealType}
                              </h3>
                              
                              {day.meals
                                .filter((meal) => meal.type === mealType)
                                .map((meal) => (
                                  <Card key={meal.id} className="overflow-hidden">
                                    <div className="aspect-video">
                                      <img 
                                        src={meal.recipeImage} 
                                        alt={meal.recipeName} 
                                        className="h-full w-full object-cover"
                                      />
                                    </div>
                                    <CardContent className="p-3">
                                      <p className="font-medium line-clamp-1">
                                        {meal.recipeName}
                                      </p>
                                      <div className="flex justify-between items-center mt-2">
                                        <Button 
                                          variant="ghost" 
                                          size="sm" 
                                          className="h-8 w-8 p-0"
                                          onClick={() => {
                                            // Remove meal from day
                                            const updatedDays = activeMealPlan.days.map((d) =>
                                              d.id === day.id
                                                ? { ...d, meals: d.meals.filter((m) => m.id !== meal.id) }
                                                : d
                                            );
                                            
                                            updateMealPlan({
                                              ...activeMealPlan,
                                              days: updatedDays,
                                            });
                                            
                                            toast({
                                              title: "Meal removed",
                                              description: `${meal.recipeName} has been removed from ${day.name}.`,
                                            });
                                          }}
                                        >
                                          <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                        <Button 
                                          variant="ghost" 
                                          size="sm"
                                          onClick={() => navigate(`/recipe/${meal.recipeId}`)}
                                        >
                                          View
                                        </Button>
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              
                              {day.meals.filter((meal) => meal.type === mealType).length === 0 && (
                                <div className="border rounded-lg p-4 text-center">
                                  <p className="text-muted-foreground text-sm">
                                    No {mealType} planned
                                  </p>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="mt-2"
                                    onClick={() => navigate('/recipes')}
                                  >
                                    Add {mealType}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Create Meal Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Meal Plan</DialogTitle>
            <DialogDescription>
              Create a new meal plan to organize your weekly meals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="name" className="text-sm font-medium">
                Plan Name
              </label>
              <Input
                id="name"
                value={newPlanName}
                onChange={(e) => setNewPlanName(e.target.value)}
                placeholder="My Weekly Meal Plan"
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (Optional)
              </label>
              <Input
                id="description"
                value={newPlanDescription}
                onChange={(e) => setNewPlanDescription(e.target.value)}
                placeholder="A balanced meal plan for the week"
              />
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