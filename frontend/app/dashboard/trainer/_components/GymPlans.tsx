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
}

const GymPlans = () => {
    const { trainerData } = useTrainerData();
    const [gymPlans, setGymPlans] = useState<Plan[]>([]);

    const gradients = [
        'from-red-500 to-rose-600',
        'from-rose-500 to-pink-600',
        'from-pink-500 to-red-600',
    ];

    useEffect(() => {
        const fetch = async () => {
            try {
            const trainerId = trainerData?.trainer_id || (trainerData as any)?.id;
                if (!trainerId) return;
                const res = await GetTrainersGymplans(trainerId);
                const plans = res?.gymplans || res?.plans || [];
                setGymPlans(plans);
            } catch (err) {
                console.error('Failed to load gym plans', err);
            }
        };
        fetch();
    }, [trainerData]);

    return (
        <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-10">
                <span className="bg-gradient-to-r from-black-600 via-rose-400 to-black-600 bg-clip-text text-transparent">
                    Assign Gym Plans
                </span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {gymPlans.length === 0 ? (
                    <div className="text-center text-gray-400 col-span-full">No gym plans available</div>
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