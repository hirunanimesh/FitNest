
"use client";
import { GetMyPlansDetails, GetUserSubscriptions, UnsubscribeGymPlan } from '@/api/user/route';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Award, User, Clock, DollarSign, FileText, Star, X, CheckCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface TrainerPlan {
  id: number;
  title: string;
  description: string;
  img_url: string;
  category: string;
  instruction_pdf: string;
}

interface Trainer {
  id: number;
  trainer_name: string;
  profile_img: string;
  trainer_plans: TrainerPlan[];
}

interface Plan {
  plan_id: string;
  title: string;
  price: number;
  duration: string;
  description: string;
  gym_plan_trainers: { trainer: Trainer }[];
}

const GymSubscriptions = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [showUnsubscribeConfirm, setShowUnsubscribeConfirm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isUnsubscribing, setIsUnsubscribing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { getUserProfileId } = useAuth();

  const gradients = [
    'from-red-500 to-rose-600',
    'from-rose-500 to-pink-600',
    'from-pink-500 to-red-600'
  ];

  useEffect(() => {
    const fetchMySubscriptions = async () => {
      setIsLoading(true);
      try {
        const customer_id = await getUserProfileId();
        if (customer_id) {
          const MyPlans = await GetUserSubscriptions(customer_id);
          const plans = await GetMyPlansDetails(MyPlans);
          setPlans(plans.planDetails || []);
        }
      } catch (error) {
        console.error('Failed to fetch user subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMySubscriptions();
  }, [getUserProfileId]);

  const handleUnsubscribeClick = () => {
    setShowUnsubscribeConfirm(true);
  };

  const confirmUnsubscribe = async () => {
    if (!selectedPlan) return;
    
    setIsUnsubscribing(true);
    try {
      const customer_id = await getUserProfileId();
      const response = await UnsubscribeGymPlan(selectedPlan.plan_id, customer_id);
      
      if (response.canceled) {
        setShowUnsubscribeConfirm(false);
        setSelectedPlan(null);
        setShowSuccessMessage(true);
        
        setTimeout(() => {
          setShowSuccessMessage(false);
          window.location.reload();
        }, 3000);
      } else {
        alert("Failed to Unsubscribe");
      }
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      alert("Failed to Unsubscribe");
    } finally {
      setIsUnsubscribing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-red-500/30 rounded-full animate-spin border-t-red-500 mx-auto"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-rose-500/30 rounded-full animate-spin border-t-rose-500 m-auto animate-reverse"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-white">Loading Subscriptions</h3>
            <p className="text-slate-400">Fetching your plans, please wait...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4">
      <h2 className="text-4xl md:text-5xl font-black text-center mb-10 text-gray-300">
        Gym Subscriptions
      </h2>
      {plans.length === 0 ? (
        <div className="min-h-[50vh] bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-6">
            <Award className="w-16 h-16 text-red-500 mx-auto" />
            <h3 className="text-2xl font-semibold text-white">No Subscriptions Found</h3>
            <p className="text-slate-300 max-w-md">
              You currently have no active gym subscriptions. Explore our gyms and find the perfect plan to start your fitness journey!
            </p>
            <Button
              className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
              onClick={() => window.location.href = 'user/search'}
            >
              Explore Gyms
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const gradient = gradients[index % gradients.length];
            return (
              <Card
                key={plan.plan_id}
                onClick={() => setSelectedPlan(plan)}
                className="cursor-pointer group bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 flex flex-col overflow-hidden relative"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
                />
                <CardHeader className="relative text-center pb-6 space-y-4">
                  <div
                    className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-xl`}
                  >
                    <Award className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-white group-hover:text-red-100 transition-colors">
                    {plan.title}
                  </CardTitle>
                  <div className="space-y-2">
                    <div className="text-5xl font-black text-white">
                      ${plan.price}
                    </div>
                    <div className="flex items-center justify-center gap-2 text-slate-300">
                      <span className="text-lg font-medium">
                        per {plan.duration}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative flex flex-col flex-grow space-y-6 p-6">
                  <p className="text-slate-300 text-center leading-relaxed flex-grow group-hover:text-red-100 transition-colors">
                    {plan.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
        <DialogContent className="max-w-5xl max-h-[95vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50 text-white overflow-hidden p-0">
          {selectedPlan && (
            <>
              <div className="relative bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-6 border-b border-slate-600/30">
                <DialogHeader className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
                      <Award className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-3xl font-bold text-white mb-2">{selectedPlan.title}</DialogTitle>
                      <DialogDescription className="text-slate-300 text-lg">
                        {selectedPlan.description}
                      </DialogDescription>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-6 justify-between">
                    <div className='flex flex-row gap-2'>  
                      <div className="flex items-center gap-2 bg-slate-700/30 px-4 py-2 rounded-full">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-xl font-bold text-green-400">${selectedPlan.price}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-700/30 px-4 py-2 rounded-full">
                        <Clock className="w-5 h-5 text-blue-400" />
                        <span className="text-lg text-blue-400">{selectedPlan.duration}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-slate-700/30 px-4 py-2 rounded-full">
                        <User className="w-5 h-5 text-purple-400" />
                        <span className="text-lg text-purple-400">{selectedPlan.gym_plan_trainers.length} Trainer{selectedPlan.gym_plan_trainers.length > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div>
                      <Button 
                        size='lg' 
                        className='text-lg font-bold bg-red-600 hover:bg-red-700 text-white'
                        onClick={handleUnsubscribeClick}
                      >
                        Unsubscribe
                      </Button>
                    </div>
                  </div>
                </DialogHeader>
              </div>
              <div className="overflow-y-auto px-8 py-6 space-y-8" style={{ maxHeight: 'calc(95vh - 200px)' }}>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Star className="w-4 h-4 text-white" />
                    </div>
                    Your Trainers
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedPlan.gym_plan_trainers.map(({ trainer }) => (
                      <div key={trainer.id} className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/30 hover:border-slate-600/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img
                              src={trainer.profile_img}
                              alt={trainer.trainer_name}
                              className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-600"
                            />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>
                          <div>
                            <h4 className="text-xl font-semibold text-white">{trainer.trainer_name}</h4>
                            <p className="text-slate-400">Professional Trainer</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    Training Plans
                  </h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {selectedPlan.gym_plan_trainers.flatMap(({ trainer }) =>
                      trainer.trainer_plans.map(tp => (
                        <div key={tp.id} className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30 hover:border-slate-600/50 transition-all duration-300 hover:transform hover:scale-105">
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={tp.img_url} 
                              alt={tp.title} 
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                            <div className="absolute top-4 right-4">
                              <span className="bg-slate-900/80 backdrop-blur-sm text-xs px-3 py-1 rounded-full text-slate-300 border border-slate-600/50">
                                {tp.category}
                              </span>
                            </div>
                          </div>
                          <div className="p-6 space-y-4">
                            <h4 className="text-xl font-bold text-white">{tp.title}</h4>
                            <p className="text-slate-400 leading-relaxed">{tp.description}</p>
                            {tp.instruction_pdf && (
                              <div className="space-y-2">
                                <h5 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                  <FileText className="w-4 h-4" />
                                  Instructions
                                </h5>
                                <a
                                  href={tp.instruction_pdf}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 px-3 py-2 rounded-lg text-sm font-medium transition-colors border border-red-600/20 hover:border-red-600/30"
                                >
                                  <FileText className="w-4 h-4" />
                                  View PDF
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={showUnsubscribeConfirm} onOpenChange={setShowUnsubscribeConfirm}>
        <DialogContent className="max-w-md bg-slate-900 border-slate-700/50 text-white">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              Confirm Unsubscription
            </DialogTitle>
            <DialogDescription className="text-center text-slate-400 text-lg">
              Are you sure you want to unsubscribe from <span className="font-semibold text-white">{selectedPlan?.title}</span>? 
              You will lose access to all training plans and trainer resources after billing cycle end.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1 border-slate-600 text-black hover:bg-slate-800 hover:text-white"
              onClick={() => setShowUnsubscribeConfirm(false)}
              disabled={isUnsubscribing}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={confirmUnsubscribe}
              disabled={isUnsubscribing}
            >
              {isUnsubscribing ? 'Unsubscribing...' : 'Yes, Unsubscribe'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full mx-4 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Successfully Unsubscribed!</h3>
            <p className="text-slate-400 mb-4">
              You have been unsubscribed from <span className="font-semibold text-white">{selectedPlan?.title}</span>
            </p>
            <div className="text-sm text-slate-500">Redirecting in a moment...</div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        .animate-reverse {
          animation: reverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GymSubscriptions;