import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Edit, Trash2, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle } from 'lucide-react';
import { 
  GetGymPlans, 
  GetTrainers, 
  CreateGymPlan, 
  UpdateGymPlan, 
  DeleteGymPlan,
  AssignTrainersToPlan,
  UpdatePlanTrainers,
  GetPlanTrainers
} from '@/api/gym/route';
import { useGym } from '../context/GymContext';
import { toast } from 'sonner';
import VerifiedActions from '@/components/VerifiedActions';

// TypeScript interfaces
interface Trainer {
  id: string | number;
  trainer_name: string;
  contact_no: string;
  verified: boolean;
  years_of_experience: number;
  profile_img: string | null;
}

interface Plan {
  plan_id: string;
  title: string;
  price: number;
  description: string;
  duration: string;
  gym_id: string;
  created_at: string;
  price_id_stripe: string | null;
  product_id_stripe: string | null;
  trainers: string[];
}

interface GymPlansResponse {
  data: {
    gymPlan: Plan[];
  };
}

interface TrainersResponse {
  data: {
    trainers_data: Array<{
      trainer: Trainer;
      approved: boolean;
      request_id: string | number;
    }>;
  };
}

const PlansTab: React.FC = () => {
  const [isPlanDialogOpen, setIsPlanDialogOpen] = useState<boolean>(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingTrainers, setLoadingTrainers] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { gymId } = useGym();

  const [currentPlan, setCurrentPlan] = useState<{
    plan_id: string | null;
    title: string;
    price: string;
    description: string;
    duration: string;
    trainers: string[];
  }>({
    plan_id: null,
    title: '',
    price: '',
    description: '',
    duration: '1 month',
    trainers: [],
  });

  // Fetch gym plans
  useEffect(() => {
    const fetchGymPlans = async () => {
      try {
        setLoading(true);
        
        // Clear cache on fresh load to ensure data consistency
        const cacheKey = `gymPlans_${gymId}`;
        
        // Fetch fresh data from API
        const response: GymPlansResponse = await GetGymPlans(gymId);
        if (response?.data?.gymPlan) {
          console.log('Fetched plans:', response.data.gymPlan);
          
          // Load trainer data for each plan
          const plansWithTrainers = await Promise.all(
            response.data.gymPlan.map(async (plan) => {
              try {
                console.log(`Fetching trainers for plan ${plan.plan_id}`);
                const trainersResponse = await GetPlanTrainers(plan.plan_id);
                console.log(`Trainers response for plan ${plan.plan_id}:`, trainersResponse);
                
                let trainerIds: string[] = [];
                // Handle different possible response structures
                if (trainersResponse?.data?.data) {
                  const trainersArray = trainersResponse.data.data;
                  if (Array.isArray(trainersArray)) {
                    trainerIds = trainersArray.map((item: any) => {
                      // Handle different possible data structures
                      return String(item.trainer_id || item.id || item);
                    });
                  }
                } else if (trainersResponse?.data && Array.isArray(trainersResponse.data)) {
                  trainerIds = trainersResponse.data.map((item: any) => String(item.trainer_id || item.id || item));
                }
                
                console.log(`Trainer IDs for plan ${plan.plan_id}:`, trainerIds);
                return { ...plan, trainers: trainerIds };
              } catch (error) {
                console.error(`Error fetching trainers for plan ${plan.plan_id}:`, error);
                return { ...plan, trainers: [] };
              }
            })
          );
          
          console.log('Plans with trainers:', plansWithTrainers);
          setPlans(plansWithTrainers);
          
          // Cache the updated data
          localStorage.setItem(cacheKey, JSON.stringify(plansWithTrainers));
        } else {
          setErrorMessage('No plans found for this gym');
          toast.error('No plans found for this gym');
        }
      } catch (error) {
        console.error('Error fetching gym plans:', error);
        setErrorMessage('Failed to load gym plans. Please try again.');
        toast.error('Failed to load gym plans');
      } finally {
        setLoading(false);
      }
    };

    if (gymId) {
      fetchGymPlans();
    }
  }, [gymId]);

  // Fetch trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoadingTrainers(true);
        
        // Try cache first
        const trainerCacheKey = `gymTrainers_${gymId}`;
        const cachedTrainers = localStorage.getItem(trainerCacheKey);
        
        if (cachedTrainers) {
          try {
            const parsedTrainers = JSON.parse(cachedTrainers);
            setTrainers(parsedTrainers);
            setLoadingTrainers(false);
          } catch (e) {
            console.error('Failed to parse cached trainers');
          }
        }

        // Background fetch
        const response: TrainersResponse = await GetTrainers(gymId);
        if (response?.data?.trainers_data) {
          const approvedTrainers = response.data.trainers_data
            .filter((item) => item.approved)
            .map((item) => item.trainer);
          setTrainers(approvedTrainers);
          localStorage.setItem(trainerCacheKey, JSON.stringify(approvedTrainers));
        } else {
          if (!cachedTrainers) {
            setErrorMessage('No trainers found for this gym');
            toast.info('No trainers found for this gym');
          }
        }
      } catch (error) {
        setErrorMessage('Failed to load trainers.');
        toast.error('Failed to load trainers');
      } finally {
        setLoadingTrainers(false);
      }
    };

    if (gymId) {
      fetchTrainers();
    }
  }, [gymId]);

  const handleEditPlan = (plan: Plan) => {
    // Immediate UI update - no API calls needed
    setCurrentPlan({
      plan_id: plan.plan_id,
      title: plan.title,
      price: plan.price.toString(),
      description: plan.description,
      duration: plan.duration,
      trainers: plan.trainers || [],
    });
    setIsPlanDialogOpen(true);
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const planToDelete = plans.find(plan => plan.plan_id === planId);
      if (planToDelete && planToDelete.trainers && planToDelete.trainers.length > 0) {
        setErrorMessage('Cannot delete plan with assigned trainers. Remove trainers first.');
        toast.error('Cannot delete plan with assigned trainers');
        setTimeout(() => setErrorMessage(''), 3000);
        return;
      }

      // Optimistic update - remove from UI immediately
      setPlans((prev) => prev.filter((plan) => plan.plan_id !== planId));
      setSuccessMessage('Plan deleted successfully');
      toast.success('Plan deleted successfully');
      setTimeout(() => setSuccessMessage(''), 3000);

      // API call in background
      await DeleteGymPlan(planId);
    } catch (error) {
      // Revert optimistic update on error
      const planToRestore = plans.find(plan => plan.plan_id === planId);
      if (planToRestore) {
        setPlans((prev) => [...prev, planToRestore]);
      }
      setErrorMessage('Failed to delete plan. Please try again.');
      toast.error('Failed to delete plan');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gymId) {
      setErrorMessage('Gym ID is missing. Cannot create or update plan.');
      toast.error('Gym ID is missing');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    // Close dialog immediately for better UX
    setIsPlanDialogOpen(false);

    try {
      if (currentPlan.plan_id) {
        console.log('Updating plan:', currentPlan.plan_id, 'with trainers:', currentPlan.trainers);
        
        // API calls first for edit to ensure data persistence
        await UpdateGymPlan(currentPlan.plan_id, currentPlan);
        console.log('Plan updated successfully');
        
        await UpdatePlanTrainers(currentPlan.plan_id, currentPlan.trainers);
        console.log('Plan trainers updated successfully');

        // Update UI after successful API calls
        const optimisticUpdate = {
          plan_id: currentPlan.plan_id,
          title: currentPlan.title,
          price: parseFloat(currentPlan.price),
          description: currentPlan.description,
          duration: currentPlan.duration,
          trainers: currentPlan.trainers,
          gym_id: gymId,
          created_at: '',
          price_id_stripe: null,
          product_id_stripe: null,
        };

        setPlans((prev) =>
          prev.map((plan) =>
            plan.plan_id === currentPlan.plan_id ? optimisticUpdate : plan
          )
        );
        
        setSuccessMessage('Plan updated successfully');
        toast.success('Plan updated successfully');
        
      } else {
        console.log('Creating new plan with trainers:', currentPlan.trainers);
        
        // API calls first for create to ensure data persistence
        const response = await CreateGymPlan(gymId, currentPlan);
        const newPlan: Plan = response.data.gymPlan;
        console.log('New plan created:', newPlan);

        // Assign trainers if any
        if (currentPlan.trainers.length > 0) {
          await AssignTrainersToPlan(newPlan.plan_id, currentPlan.trainers);
          console.log('Trainers assigned to new plan successfully');
        }

        // Update UI with the new plan including trainers
        const newPlanWithTrainers = {
          ...newPlan,
          trainers: currentPlan.trainers
        };

        setPlans((prev) => [...prev, newPlanWithTrainers]);
        setSuccessMessage('Plan created successfully');
        toast.success('Plan created successfully');
      }

      // Clear form and update cache
      setCurrentPlan({
        plan_id: null,
        title: '',
        price: '',
        description: '',
        duration: '1 month',
        trainers: [],
      });

      // Update cache with latest data
      const cacheKey = `gymPlans_${gymId}`;
      setPlans((currentPlans) => {
        localStorage.setItem(cacheKey, JSON.stringify(currentPlans));
        return currentPlans;
      });

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving plan:', error);
      setErrorMessage('Failed to save plan. Please try again.');
      toast.error('Failed to save plan');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  const toggleTrainer = (trainerId: string | number) => {
    const trainerIdStr = String(trainerId);
    setCurrentPlan((prev) => ({
      ...prev,
      trainers: prev.trainers.includes(trainerIdStr)
        ? prev.trainers.filter((id) => id !== trainerIdStr)
        : [...prev.trainers, trainerIdStr],
    }));
  };

  const getTrainerNames = (trainerIds: string[]): string => {
    if (!trainerIds || trainerIds.length === 0) return 'No trainers assigned';
    const assignedTrainers = trainers.filter((trainer) =>
      trainerIds.includes(String(trainer.id))
    );
    if (assignedTrainers.length === 0) return 'No trainers assigned';
    return assignedTrainers.map((trainer) => trainer.trainer_name).join(', ');
  };

  const formatPrice = (price: number): string => {
    return `$${price.toLocaleString()}`;
  };

  const refreshPlansData = async () => {
    if (!gymId) return;
    
    // Clear cache and reload fresh data
    const cacheKey = `gymPlans_${gymId}`;
    localStorage.removeItem(cacheKey);
    
    setLoading(true);
    try {
      const response: GymPlansResponse = await GetGymPlans(gymId);
      if (response?.data?.gymPlan) {
        const plansWithTrainers = await Promise.all(
          response.data.gymPlan.map(async (plan) => {
            try {
              const trainersResponse = await GetPlanTrainers(plan.plan_id);
              let trainerIds: string[] = [];
              if (trainersResponse?.data?.data) {
                const trainersArray = trainersResponse.data.data;
                if (Array.isArray(trainersArray)) {
                  trainerIds = trainersArray.map((item: any) => String(item.trainer_id || item.id || item));
                }
              }
              return { ...plan, trainers: trainerIds };
            } catch (error) {
              return { ...plan, trainers: [] };
            }
          })
        );
        
        setPlans(plansWithTrainers);
        localStorage.setItem(cacheKey, JSON.stringify(plansWithTrainers));
        toast.success('Plans data refreshed successfully');
      }
    } catch (error) {
      toast.error('Failed to refresh plans data');
    } finally {
      setLoading(false);
    }
  };

  // Loading spinner for plans
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Card className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50">
        <CardHeader className="px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl sm:text-2xl text-white">
                Gym Plans Management
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-slate-400 mt-1">
                Manage subscription plans and pricing
              </CardDescription>
            </div>
            <VerifiedActions role="gym">
              <Button
                onClick={() => {
                  setCurrentPlan({
                    plan_id: null,
                    title: '',
                    price: '',
                    description: '',
                    duration: '1 month',
                    trainers: [],
                  });
                  setIsPlanDialogOpen(true);
                }}
                className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Plan
              </Button>
            </VerifiedActions>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 py-6">
          {successMessage && (
            <Alert className="mb-4 bg-green-500/10 border-green-500/50 text-green-200 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}
          {errorMessage && (
            <Alert className="mb-4 bg-red-500/10 border-red-500/50 text-red-200 rounded-lg">
              <XCircle className="h-4 w-4 text-red-400" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm sm:text-base">
                No plans found. Create your first plan to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-b border-gray-700/50">
                    <TableHead className="text-gray-300 text-xs sm:text-sm font-semibold uppercase w-[20%]">Plan Name</TableHead>
                    <TableHead className="text-gray-300 text-xs sm:text-sm font-semibold uppercase w-[15%]">Price</TableHead>
                    <TableHead className="text-gray-300 text-xs sm:text-sm font-semibold uppercase w-[18%]">Duration</TableHead>
                    <TableHead className="text-gray-300 text-xs sm:text-sm font-semibold uppercase w-[22%]">Description</TableHead>
                    <TableHead className="text-gray-300 text-xs sm:text-sm font-semibold uppercase w-[20%]">Assigned Trainers</TableHead>
                    <TableHead className="text-gray-300 text-xs sm:text-sm font-semibold uppercase w-[15%]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {plans.map((plan) => (
                    <TableRow key={plan.plan_id} className="border-b border-gray-700/50 hover:bg-red-500/10">
                      <TableCell className="text-white text-xs sm:text-sm font-medium">{plan.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-400 border-green-400/50 text-xs sm:text-sm px-2 sm:px-3 py-0.5 truncate">
                          {formatPrice(plan.price)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-pink-400 border-pink-400/50 text-xs sm:text-sm px-2 sm:px-3 py-0.5 truncate text-ellipsis overflow-hidden whitespace-nowrap">
                          {plan.duration}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300 text-xs sm:text-sm">{plan.description}</TableCell>
                      <TableCell className="text-slate-300 text-xs sm:text-sm">
                        <div className="flex flex-wrap gap-2">
                          {plan.trainers && plan.trainers.length > 0 ? (
                            plan.trainers.slice(0, 2).map((trainerId, index) => {
                              const trainer = trainers.find(
                                (t) => String(t.id) === String(trainerId)
                              );
                              if (!trainer) {
                                return (
                                  <div
                                    key={index}
                                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-600 flex items-center justify-center text-xs sm:text-sm text-white font-bold border-2 border-red-400"
                                    title="Unknown Trainer"
                                  >
                                    ?
                                  </div>
                                );
                              }
                              
                              return (
                                <div key={index} className="relative">
                                  {trainer.profile_img ? (
                                    <img
                                      src={trainer.profile_img}
                                      alt={trainer.trainer_name}
                                      className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-500 hover:border-red-400 transition-colors"
                                      title={trainer.trainer_name}
                                      onError={(e) => {
                                        // Hide the broken image and show fallback
                                        e.currentTarget.style.display = 'none';
                                        const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                      }}
                                    />
                                  ) : null}
                                  <div
                                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-xs sm:text-sm text-white font-bold border-2 border-red-400 ${trainer.profile_img ? 'hidden' : 'flex'}`}
                                    title={trainer.trainer_name}
                                    style={{ display: trainer.profile_img ? 'none' : 'flex' }}
                                  >
                                    {trainer.trainer_name ? trainer.trainer_name.charAt(0).toUpperCase() : 'T'}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <span className="text-slate-500 text-xs sm:text-sm">
                              No trainers assigned
                            </span>
                          )}
                          {plan.trainers && plan.trainers.length > 2 && (
                            <Badge variant="secondary" className="text-xs sm:text-sm bg-gray-700 text-slate-300">
                              +{plan.trainers.length - 2} more
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <VerifiedActions role="gym">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-black border-gray-600 hover:bg-white px-3 sm:px-4 py-1.5 sm:py-2"
                              onClick={() => handleEditPlan(plan)}
                            >
                              <Edit className="mr-1 h-4 w-4" />
                              Edit
                            </Button>
                          </VerifiedActions>
                          <VerifiedActions role="gym">
                            <Button
                              size="sm"
                              variant="destructive"
                              className="bg-red-600 hover:bg-red-700 px-3 sm:px-4 py-1.5 sm:py-2"
                              onClick={() => handleDeletePlan(plan.plan_id)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Delete
                            </Button>
                          </VerifiedActions>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 max-w-[95vw] sm:max-w-lg rounded-lg p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl text-white">
              {currentPlan.plan_id ? 'Edit Plan' : 'Add New Plan'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePlanSubmit} className="space-y-4 ">
            <div className="space-y-2 text-white">
              <Label htmlFor="title" className='text-white'>Plan Name</Label>
              <Input
                id="title"
                value={currentPlan.title}
                className='text-black'
                onChange={(e) =>
                  setCurrentPlan({ ...currentPlan, title: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price" className='text-white'>Price</Label>
              <Input
                id="price"
                type="number"
                value={currentPlan.price}
                onChange={(e) =>
                  setCurrentPlan({ ...currentPlan, price: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className='text-white'>Description</Label>
              <Input
                id="description"
                value={currentPlan.description}
                onChange={(e) =>
                  setCurrentPlan({ ...currentPlan, description: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white text-sm sm:text-base">Duration</Label>
              <Select
                value={currentPlan.duration}
                onValueChange={(value) =>
                  setCurrentPlan({ ...currentPlan, duration: value })
                }
              >
                <SelectTrigger className=" border-gray-600 text-black w-full text-sm sm:text-base">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent className=" border-gray-700">
                  <SelectItem value="1 day">1 day</SelectItem>
                  <SelectItem value="1 week">1 week</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="1 year">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>


            <div className="space-y-2">
              <Label className='text-white'>Assign Trainers</Label>
              {loadingTrainers ? (
                <div className="flex justify-center items-center h-16">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-red-500"></div>
                </div>
              ) : trainers.length === 0 ? (
                <div className="text-slate-400 text-sm sm:text-base">
                  No approved trainers available
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-600 rounded-lg p-3 sm:p-4">
                  {trainers.map((trainer) => (
                    <div key={trainer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`trainer-${trainer.id}`}
                        checked={currentPlan.trainers.includes(String(trainer.id))}
                        onCheckedChange={() => toggleTrainer(trainer.id)}
                        className="border-gray-600 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500 h-5 w-5 sm:h-6 sm:w-6"
                      />
                      <Label htmlFor={`trainer-${trainer.id}`} className="text-sm sm:text-base text-slate-300 flex-1">
                        <div className="flex items-center justify-between">
                          <span>{trainer.trainer_name}</span>
                          <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-400">
                            <span>{trainer.years_of_experience}y</span>
                            {trainer.verified && (
                              <Badge className="bg-green-500/50 text-green-200 text-xs px-1 py-0">✓</Badge>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPlanDialogOpen(false)}
                className="w-full sm:w-auto order-2 sm:order-1 text-black border-gray-600 hover:bg-gray-100"
              >
                Cancel
              </Button>
              <VerifiedActions role="gym">
                <Button
                  type="submit"
                  className="w-full sm:w-auto order-1 sm:order-2 bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg font-semibold transition-all duration-300"
                >
                  {currentPlan.plan_id ? 'Update Plan' : 'Create Plan'}
                </Button>
              </VerifiedActions>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansTab;
