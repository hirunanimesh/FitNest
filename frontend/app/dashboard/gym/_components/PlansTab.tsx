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
import { GetGymPlans, GetTrainers } from '@/api/gym/route';
import { useGym } from '../context/GymContext';
import { toast } from 'sonner';

// Define interfaces for TypeScript
interface Trainer {
  id: string | number;
  trainer_name: string;
  contact_no: string;
  verified: boolean;
  rating: number;
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
  trainers?: string[];
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

  // Fetch gym plans from database
  useEffect(() => {
    const fetchGymPlans = async () => {
      try {
        setLoading(true);
        const response: GymPlansResponse = await GetGymPlans(gymId);
        if (response?.data?.gymPlan) {
          setPlans(response.data.gymPlan);
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

  // Fetch approved trainers for this gym
  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        setLoadingTrainers(true);
        const response: TrainersResponse = await GetTrainers(gymId);
        if (response?.data?.trainers_data) {
          const approvedTrainers = response.data.trainers_data
            .filter((item) => item.approved)
            .map((item) => item.trainer);
          setTrainers(approvedTrainers);
        } else {
          console.log('No trainers found for this gym');
          toast.info('No trainers found for this gym');
        }
      } catch (error) {
        console.error('Error fetching trainers:', error);
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
      // TODO: Implement delete API call
      // await DeleteGymPlan(planId);

      setPlans((prev) => prev.filter((plan) => plan.plan_id !== planId));
      setSuccessMessage('Plan deleted successfully');
      toast.success('Plan deleted successfully');

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting plan:', error);
      setErrorMessage('Failed to delete plan. Please try again.');
      toast.error('Failed to delete plan');

      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
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

    try {
      if (currentPlan.plan_id) {
        // TODO: Implement update API call
        // await UpdateGymPlan(currentPlan.plan_id, currentPlan);

        setPlans((prev) =>
          prev.map((plan) =>
            plan.plan_id === currentPlan.plan_id
              ? {
                  ...plan,
                  title: currentPlan.title,
                  price: parseFloat(currentPlan.price),
                  description: currentPlan.description,
                  duration: currentPlan.duration,
                  trainers: currentPlan.trainers,
                }
              : plan
          )
        );
        setSuccessMessage('Plan updated successfully');
        toast.success('Plan updated successfully');
      } else {
        // TODO: Implement create API call
        // const newPlan = await CreateGymPlan(gymId, currentPlan);

        const newPlan: Plan = {
          plan_id: `temp-${Date.now()}`,
          title: currentPlan.title,
          price: parseFloat(currentPlan.price),
          description: currentPlan.description,
          duration: currentPlan.duration,
          gym_id: gymId,
          created_at: new Date().toISOString(),
          price_id_stripe: null,
          product_id_stripe: null,
          trainers: currentPlan.trainers,
        };

        setPlans((prev) => [...prev, newPlan]);
        setSuccessMessage('Plan created successfully');
        toast.success('Plan created successfully');
      }

      setCurrentPlan({
        plan_id: null,
        title: '',
        price: '',
        description: '',
        duration: '1 month',
        trainers: [],
      });
      setIsPlanDialogOpen(false);

      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving plan:', error);
      setErrorMessage('Failed to save plan. Please try again.');
      toast.error('Failed to save plan');

      setTimeout(() => {
        setErrorMessage('');
      }, 3000);
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

  if (loading) {
    return (
      <Card className="bg-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-300">Loading gym plans...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <Card className="bg-gray-800 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gym Plans Management</CardTitle>
              <CardDescription className="text-gray-300">
                Manage subscription plans and pricing
              </CardDescription>
            </div>
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
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {successMessage && (
            <Alert className="mb-4 border-green-500 bg-green-50 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          {errorMessage && (
            <Alert className="mb-4 border-red-500 bg-red-50 text-red-800">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">
                No plans found. Create your first plan to get started.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-gray-300">Plan Name</TableHead>
                  <TableHead className="text-gray-300">Price</TableHead>
                  <TableHead className="text-gray-300">Duration</TableHead>
                  <TableHead className="text-gray-300">Description</TableHead>
                  <TableHead className="text-gray-300">Assigned Trainers</TableHead>
                  <TableHead className="text-gray-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => (
                  <TableRow key={plan.plan_id}>
                    <TableCell className="font-medium text-white">
                      {plan.title}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-green-400 border-green-400">
                        {formatPrice(plan.price)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        {plan.duration}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs truncate">
                      {plan.description}
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {plan.trainers && plan.trainers.length > 0 ? (
                          plan.trainers.slice(0, 2).map((trainerId, index) => {
                            const trainer = trainers.find(
                              (t) => String(t.id) === String(trainerId)
                            );
                            return trainer ? (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {trainer.trainer_name}
                              </Badge>
                            ) : null;
                          })
                        ) : (
                          <span className="text-gray-500 text-xs">
                            No trainers assigned
                          </span>
                        )}
                        {plan.trainers && plan.trainers.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{plan.trainers.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-black hover:text-white"
                          onClick={() => handleEditPlan(plan)}
                        >
                          <Edit className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeletePlan(plan.plan_id)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPlanDialogOpen} onOpenChange={setIsPlanDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border border-gray-700">
          <DialogHeader>
            <DialogTitle>
              {currentPlan.plan_id ? 'Edit Plan' : 'Add New Plan'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePlanSubmit} className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Title</Label>
              <Input
                className="text-gray-800 bg-white"
                placeholder="Enter plan name"
                value={currentPlan.title}
                onChange={(e) =>
                  setCurrentPlan((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Price</Label>
              <Input
                className="text-gray-800 bg-white"
                type="number"
                step="0.01"
                placeholder="e.g., 2500"
                value={currentPlan.price}
                onChange={(e) =>
                  setCurrentPlan((prev) => ({
                    ...prev,
                    price: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Description</Label>
              <Input
                className="text-gray-800 bg-white"
                placeholder="Enter plan description"
                value={currentPlan.description}
                onChange={(e) =>
                  setCurrentPlan((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                required
              />
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Duration</Label>
              <Select
                value={currentPlan.duration}
                onValueChange={(value) =>
                  setCurrentPlan((prev) => ({
                    ...prev,
                    duration: value,
                  }))
                }
              >
                <SelectTrigger className="w-full text-gray-800 bg-white">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1 day">1 day</SelectItem>
                  <SelectItem value="1 week">1 week</SelectItem>
                  <SelectItem value="1 month">1 month</SelectItem>
                  <SelectItem value="3 months">3 months</SelectItem>
                  <SelectItem value="6 months">6 months</SelectItem>
                  <SelectItem value="1 year">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Assign Trainers
              </Label>
              {loadingTrainers ? (
                <div className="text-gray-400 text-sm">Loading trainers...</div>
              ) : trainers.length === 0 ? (
                <div className="text-gray-400 text-sm">
                  No approved trainers available
                </div>
              ) : (
                <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-600 rounded p-3">
                  {trainers.map((trainer) => (
                    <div key={trainer.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`trainer-${trainer.id}`}
                        checked={currentPlan.trainers.includes(String(trainer.id))}
                        onCheckedChange={() => toggleTrainer(trainer.id)}
                      />
                      <Label
                        htmlFor={`trainer-${trainer.id}`}
                        className="text-sm flex-1"
                      >
                        <div className="flex items-center justify-between">
                          <span>{trainer.trainer_name}</span>
                          <div className="flex items-center space-x-2 text-xs text-gray-400">
                            <span>⭐ {trainer.rating}</span>
                            <span>{trainer.years_of_experience}y</span>
                            {trainer.verified && (
                              <Badge
                                className="bg-green-500 hover:bg-green-600 text-xs px-1 py-0"
                              >
                                ✓
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {currentPlan.trainers.length > 0 && (
                <div className="mt-2 text-sm text-gray-300">
                  Selected: {currentPlan.trainers.length} trainer(s)
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                className="text-black"
                variant="outline"
                onClick={() => setIsPlanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">
                {currentPlan.plan_id ? 'Update Plan' : 'Add Plan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlansTab;