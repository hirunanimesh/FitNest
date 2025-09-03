"use client";
import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Clock, User, CheckCircle, XCircle, Star } from 'lucide-react';
import { useParams } from 'next/navigation';
import { GetGymDetails, GetGymPlans } from '@/api/user/route';

// Define interfaces for TypeScript
interface OperatingHours {
    weekdays: string;
    saturday: string;
    sunday: string;
}

interface FetchedGymData {
    address: string;
    contact_no: string;
    description: string;
    documents: any;
    gym_id: number;
    gym_name: string;
    location: string;
    operating_Hours: OperatingHours | null;
    owner_name: string | null;
    profile_img: string;
    user_id: any;
    verified: boolean;
}

interface FetchedSubscriptionPlan {
    created_at: string;
    description: string;
    duration: string;
    gym_id: number;
    plan_id: string;
    price: number;
    price_id_stripe: string;
    product_id_stripe: string;
    title: string;
}

let parsedlocation : {lat:Number; lng:Number} | null = null;

const GymProfile: React.FC = () => {
    const gym_id = useParams();
    const [gymData, setGymData] = useState<FetchedGymData | null>(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState<FetchedSubscriptionPlan[]>([]);

    useEffect(() => {
        const fetchGymDetails = async () => {
            try {
                const response = await GetGymDetails(gym_id.gymId);
                if (response?.data?.gym) {
                    setGymData(response.data.gym);
                    parsedlocation = response.data.gym.location ? JSON.parse(response.data.gym.location) : null;
                    console.log("GymData Fetch success", response.data.gym);
                } else {
                    console.error("No gym data found in the response.");
                }
            } catch (error) {
                console.error("Error fetching gym details", error);
            }
        };

        const fetchGymPlans = async () => {
            try {
                const response = await GetGymPlans(gym_id.gymId);
                if (response?.data?.gymPlan) {
                    setSubscriptionPlans(response.data.gymPlan);
                    console.log("Gym Plans Fetch Success", response.data.gymPlan);
                } else {
                    console.error("No gym plans found in the response.");
                }
            } catch (error) {
                console.error("Error fetching gym plans", error);
            }
        };
        fetchGymDetails();
        fetchGymPlans();
    }, [gym_id]);

    const handleSubscribe = (planTitle: string) => {
        alert(`Thank you for choosing the ${planTitle}! Redirecting to payment...`);
    };

    if (!gymData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                Loading...
            </div>
        );
    }

    // Default values if data is null or undefined
    const name = gymData.gym_name || "Gym Name Not Available";
    const address = gymData.address || "Address Not Available";
    const description = gymData.description || "No description available for this gym.";
    const isVerified = gymData.verified ?? false;
    const ownerName = gymData.owner_name || "Owner Not Available";
    const contactNo = gymData.contact_no || "Contact No. Not Available";
    const profileImg = gymData.profile_img || 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438';

    // Use dummy operating hours if real data isn't available
    const operatingHours = gymData.operating_Hours || {
        weekdays: "Not Available",
        saturday: "Not Available",
        sunday: "Not Available"
    };

    // Hardcoded values since they are not in the fetched data
    const rating = 4.8;
    const totalReviews = 324;

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white overflow-hidden">
            {/* Hero Section */}
            <div className="relative h-[70vh] overflow-hidden">
                {/* Gym Hero Image - Using fetched image or a placeholder */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-500 to-red-700">
                    <div className="w-full h-full bg-cover bg-center bg-no-repeat opacity-80 transition-transform duration-1000 hover:scale-105"
                        style={{ backgroundImage: `url('${profileImg}')` }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/50 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center z-10 animate-fade-in">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <h1 className="text-5xl md:text-7xl font-extrabold text-white drop-shadow-2xl tracking-tight">
                                {name}
                            </h1>
                            <Badge
                                className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors duration-300 ${
                                    isVerified
                                        ? "bg-green-600 hover:bg-green-700 text-white"
                                        : "bg-red-600 hover:bg-red-700 text-white"
                                }`}
                            >
                                {isVerified ? (
                                    <>
                                        <CheckCircle className="w-4 h-4" />
                                        Verified
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-4 h-4" />
                                        Not Verified
                                    </>
                                )}
                            </Badge>
                        </div>
                        <div className="flex items-center justify-center gap-4 text-white mb-6">
                            <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full">
                                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-lg">{rating}</span>
                                <span className="text-sm">({totalReviews} reviews)</span>
                            </div>
                        </div>
                        <p className="text-xl text-white/90 max-w-4xl mx-auto px-6 leading-relaxed">
                            {description}
                        </p>
                    </div>
                </div>
                {/* Floating Elements with Enhanced Animations */}
                <div className="absolute top-12 left-12 text-white/20 text-7xl animate-float">
                    🏋️
                </div>
                <div className="absolute top-24 right-24 text-white/20 text-5xl animate-float delay-100">
                    💪
                </div>
                <div className="absolute bottom-24 left-24 text-white/20 text-6xl animate-float delay-200">
                    ⚡
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Info Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {[
                        { icon: MapPin, title: "Location", content: address },
                        { icon: Phone, title: "Contact", content: contactNo },
                        { icon: User, title: "Owner", content: ownerName },
                        {
                            icon: Clock,
                            title: "Hours",
                            content: (
                                <div className="space-y-2">
                                    <p>Mon-Fri: {operatingHours.weekdays}</p>
                                    <p>Sat: {operatingHours.saturday}</p>
                                    <p>Sun: {operatingHours.sunday}</p>
                                </div>
                            )
                        }
                    ].map((item, index) => (
                        <Card
                            key={index}
                            className="bg-gray-800/50 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 group"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <item.icon className="w-6 h-6 text-red-500 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform duration-300" />
                                    <div>
                                        <h3 className="font-bold text-lg text-white mb-3">{item.title}</h3>
                                        <div className="text-sm text-gray-200">{item.content}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Map Section */}
                <Card className="mb-16 bg-gray-800/50 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-all duration-500">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl text-white">
                        <MapPin className="w-6 h-6 text-red-500" />
                        Location & Directions
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {parsedlocation ? (
                        <iframe
                            width="100%"
                            height="300"
                            className="rounded-xl border border-red-500/30"
                            style={{ border: 0 }}
                            loading="lazy"
                            allowFullScreen
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${parsedlocation.lat},${parsedlocation.lng}&zoom=15`}
                        ></iframe>
                        ) : (
                        <div className="h-72 bg-gray-700/50 rounded-xl flex items-center justify-center border border-red-500/30 text-gray-200">
                            Location not available
                        </div>
                        )}
                    </CardContent>
                </Card>

                {/* Subscription Plans */}
                <div>
                    <h2 className="text-4xl font-extrabold text-center mb-4 text-white">Membership Plans</h2>
                    <p className="text-center text-gray-300 mb-12 text-lg">Choose the perfect plan for your fitness journey</p>
                    {subscriptionPlans.length > 0 ? (
                        <div className="grid md:grid-cols-3 gap-8">
                            {subscriptionPlans.map((plan) => (
                                <Card
                                    key={plan.plan_id}
                                    className="bg-gray-800/50 backdrop-blur-sm border-red-500/30 hover:border-red-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/20 flex flex-col h-full"
                                >
                                    <CardHeader className="text-center pb-6">
                                        <CardTitle className="text-2xl font-bold text-white">{plan.title}</CardTitle>
                                        <div className="mt-6">
                                            <span className="text-4xl font-extrabold text-red-500">${plan.price}</span>
                                            <span className="text-gray-300 text-lg">/{plan.duration}</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex flex-col flex-grow space-y-8">
                                        <p className="text-gray-200 text-center text-base leading-relaxed px-4 flex-grow">
                                            {plan.description}
                                        </p>
                                        <Button
                                            onClick={() => handleSubscribe(plan.title)}
                                            className="w-full  text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/40"
                                        >
                                            Subscribe Now
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 text-lg py-12">
                            No subscription plans available at the moment.
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Tailwind Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out;
                }
                .delay-100 {
                    animation-delay: 0.1s;
                }
                .delay-200 {
                    animation-delay: 0.2s;
                }
            `}</style>
        </div>
    );
};

export default GymProfile;