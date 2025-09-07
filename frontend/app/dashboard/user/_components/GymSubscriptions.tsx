"use client";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Plan {
  id: number;
  title: string;
  price: number;
  duration: string;
  description:string;
}

const GymSubscriptions = () => {
    // Mock session data
    const mockSessions: Plan[] = [
        {
            id: 1,
            title: "Pilates Class",
            price: 50,
            duration: "1 month",
            description: "Access to all Pilates classes and facilities."
        }/*,
        {
            id: 2,
            title: "HIIT Workout",
            price: 60,
            duration: "3 months",
            description: "High intensity interval training for all levels."
        },
        {
            id: 3,
            title: "Zumba Dance",
            price: 40,
            duration: "1 month",
            description: "Fun and energetic Zumba dance sessions."
        }*/
    ];

    const gradients = [
        'from-red-500 to-rose-600',
        'from-rose-500 to-pink-600',
        'from-pink-500 to-red-600'
    ];

    return (
       
            <div className="max-w-5xl mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-black text-white text-center mb-10">
                    <span className="bg-gradient-to-r from-blue-800 via-rose-400 to-blue-800 bg-clip-text text-transparent">
                        Gym Subscriptions
                    </span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {mockSessions.map((plan, index) => {
                        const gradient = gradients[index % gradients.length];
                        return (
                            <Card
                                key={plan.id}
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
                                            ${plan.price}
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-slate-300">
                                            {/* Duration icon if needed */}
                                            <span className="text-lg font-medium">per {plan.duration}</span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="relative flex flex-col flex-grow space-y-6 p-6">
                                    <p className="text-slate-300 text-center leading-relaxed flex-grow group-hover:text-red-100 transition-colors">
                                        {plan.description}
                                    </p>
                                </CardContent>
                                <Button
                                    disabled
                                    className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-bold py-4 text-lg rounded-xl opacity-80 "
                                >
                                    UnSubscribed
                                </Button>
                            </Card>
                        );
                    })}
                </div>
            
            {/* Custom Styles */}
            <style jsx global>{`
                html {
                    scroll-behavior: smooth;
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(5deg); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes reverse {
                    from { transform: rotate(360deg); }
                    to { transform: rotate(0deg); }
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                .animate-reverse {
                    animation: reverse 2s linear infinite;
                }
                .delay-100 {
                    animation-delay: 0.1s;
                }
                .delay-200 {
                    animation-delay: 0.2s;
                }
                .delay-1000 {
                    animation-delay: 1s;
                }
            `}</style>
        </div>
    );
};

export default GymSubscriptions;