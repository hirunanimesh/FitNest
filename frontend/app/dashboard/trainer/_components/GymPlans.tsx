"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { GetTrainersGymplans } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useTrainerData } from '../context/TrainerContext';

interface Plan {
    id: number;
    title: string;
    price?: number;
    duration?: string;
    description?: string;
    gym_name?: string;
}

const GymPlans = () => {
    const { trainerData } = useTrainerData();
    const [gymPlans, setGymPlans] = useState<Plan[]>([]);

    const gradients = [
        'from-red-500 to-rose-600',
        'from-rose-500 to-pink-600',
        'from-pink-500 to-red-600',
        'from-purple-500 to-pink-600',
        'from-blue-500 to-purple-600',
        'from-green-500 to-blue-600',
        'from-yellow-500 to-red-600',
        'from-indigo-500 to-purple-600',
        'from-teal-500 to-green-600',
    ];

    useEffect(() => {
        const fetch = async () => {
            try {
                const trainerId = trainerData?.trainer_id || (trainerData as any)?.id;
                if (!trainerId) {
                    setGymPlans([]);
                    return;
                }
                const res = await GetTrainersGymplans(trainerId);
                const plans = res?.gymplans || res?.plans || [];
                setGymPlans(plans);
            } catch (err) {
                console.error('Failed to load gym plans', err);
                setGymPlans([]);
            }
        };
        fetch();
    }, [trainerData]);

    return (
        <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-10">
                Assign Gym Plans
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gymPlans.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center py-16 px-8">
                        <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-xl mb-6">
                            <Award className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-red-400 mb-4">No Gym Plans Available</h3>
                        <p className="text-red-300 text-center max-w-md leading-relaxed">
                            You haven't been assigned to any gym plans yet. Contact your gym administrator or check back later for available plans.
                        </p>
                    </div>
                ) : (
                    gymPlans.map((plan: any, index: number) => {
                        const gradient = gradients[index % gradients.length];
                        return (
                            <Card
                                key={plan.id || index}
                                className="group bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-3 flex flex-col overflow-hidden relative"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                <CardHeader className="relative text-center pb-6 space-y-4">
                                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${gradient} flex items-center justify-center shadow-xl`}>
                                        <Award className="w-8 h-8 text-white" />
                                    </div>
                                    {plan.gym_name && (
                                        <div className="text-sm font-semibold text-red-400 bg-red-400/10 px-3 py-1 rounded-full inline-block">
                                            {plan.gym_name}
                                        </div>
                                    )}
                                    <CardTitle className="text-2xl font-bold text-white group-hover:text-red-100 transition-colors">
                                        {plan.title}
                                    </CardTitle>
                                    <div className="space-y-2">
                                        <div className="text-5xl font-black text-white">
                                            ${plan.price ?? ''}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-slate-300">
                                            <span className="text-lg font-medium">per {plan.duration ?? 'term'}</span>
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
                    })
                )}
            </div>
        </div>
    );
};

export default GymPlans;