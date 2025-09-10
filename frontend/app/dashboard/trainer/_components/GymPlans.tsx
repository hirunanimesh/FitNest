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

    // Dummy gym plans data
    const dummyGymPlans: Plan[] = [
        {
            id: 1,
            title: "Premium Membership",
            price: 99,
            duration: "month",
            description: "Access to all gym facilities, group classes, personal training sessions, and premium amenities including sauna and pool.",
            gym_name: "FitZone Elite"
        },
        {
            id: 2,
            title: "Basic Membership",
            price: 49,
            duration: "month",
            description: "Essential gym access with cardio and strength training equipment. Perfect for beginners starting their fitness journey.",
            gym_name: "PowerHouse Gym"
        },
        {
            id: 3,
            title: "Student Plan",
            price: 29,
            duration: "month",
            description: "Affordable membership for students with valid ID. Includes gym access during off-peak hours and basic facilities.",
            gym_name: "Campus Fitness Center"
        },
        {
            id: 4,
            title: "Annual VIP",
            price: 999,
            duration: "year",
            description: "Ultimate fitness experience with unlimited access, personal trainer, nutrition consultation, and exclusive member events.",
            gym_name: "Elite Performance Hub"
        },
        {
            id: 5,
            title: "Family Package",
            price: 149,
            duration: "month",
            description: "Perfect for families! Includes access for up to 4 family members with kids' programs and family-friendly facilities.",
            gym_name: "Family Fitness World"
        },
        {
            id: 6,
            title: "Corporate Plan",
            price: 79,
            duration: "month",
            description: "Designed for working professionals with flexible hours, express workouts, and corporate wellness programs.",
            gym_name: "Business Fitness Solutions"
        }
    ];

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
                    // Use dummy data when no trainer ID
                    setGymPlans(dummyGymPlans);
                    return;
                }
                const res = await GetTrainersGymplans(trainerId);
                const plans = res?.gymplans || res?.plans || [];
                // Use dummy data if no real plans found
                setGymPlans(plans.length > 0 ? plans : dummyGymPlans);
            } catch (err) {
                console.error('Failed to load gym plans', err);
                // Use dummy data on error
                setGymPlans(dummyGymPlans);
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