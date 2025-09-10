"use client";
import React, { useEffect, useState, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MapPin, Phone, Clock, User, CheckCircle, XCircle, Star, Navigation, Shield, Award, Calendar } from 'lucide-react';
import { useParams } from 'next/navigation';
import { GetGymDetails, GetGymPlans, GetUserSubscriptions, SubscribeGymPlan } from '@/api/user/route';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

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

let parsedlocation: { lat: Number; lng: Number } | null = null;

const GymProfile: React.FC = () => {
    const params = useParams();
    const gymId = params.gymId as string;
    const { getUserProfileId } = useAuth();
    const [email, setEmail] = useState<string | null>(null);
    const [gymData, setGymData] = useState<FetchedGymData | null>(null);
    const [subscriptionPlans, setSubscriptionPlans] = useState<FetchedSubscriptionPlan[]>([]);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [subscriptionErrorMessage, setSubscriptionErrorMessage] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const plansSectionRef = useRef<HTMLDivElement>(null);
    const [myPlans, setMyPlans] = useState<string[]>([]);

    // Scroll to top on page load
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    // Fetch user subscriptions - FIXED: Added proper dependency array
    useEffect(() => {
        const fetchMySubscriptions = async () => {
            try {
                const customer_id = await getUserProfileId();
                if (customer_id) {
                    const MyPlans = await GetUserSubscriptions(customer_id);
                    setMyPlans(MyPlans.planIds || []);
                }
            } catch (error) {
                console.error('Failed to fetch user subscriptions:', error);
                setMyPlans([]);
            }
        };
        fetchMySubscriptions();
    }, [getUserProfileId]); // Added dependency array

    // Handle async data fetching
    useEffect(() => {
        if (!gymId || isNaN(Number(gymId))) {
            setErrorMessage('Invalid gym ID');
            toast.error('Invalid Gym ID', {
                description: 'The provided gym ID is invalid.',
                duration: 5000,
            });
            setIsLoading(false);
            return;
        }

        let completedRequests = 0;
        const totalRequests = 3; // fetchGymDetails, getSession, fetchGymPlans

        const handleRequestCompletion = () => {
            completedRequests++;
            if (completedRequests === totalRequests) {
                setIsLoading(false);
            }
        };

        const fetchGymDetails = async () => {
            try {
                const response = await GetGymDetails(gymId);
                if (response?.data?.gym) {
                    setGymData(response.data.gym);
                    parsedlocation = response.data.gym.location ? JSON.parse(response.data.gym.location) : null;
                    setErrorMessage(''); // Clear any previous error
                } else {
                    setErrorMessage('Gym not found');
                    toast.info('Gym Not Found', {
                        description: 'No gym data found for the provided ID.',
                        duration: 5000,
                    });
                    setTimeout(() => setErrorMessage(''), 5000);
                }
            } catch (error: any) {
                let errorMsg = 'Failed to load gym information';
                let errorDesc = 'Please try again later.';
                if (error.response?.status === 404) {
                    errorMsg = 'Gym Not Found';
                    errorDesc = 'The requested gym could not be found.';
                } else if (error.response?.status === 400) {
                    errorMsg = 'Invalid Request';
                    errorDesc = 'The request contains invalid data.';
                } else if (error.response?.status === 401) {
                    errorMsg = 'Authentication Required';
                    errorDesc = 'Please log in to view gym details.';
                }
                setErrorMessage(errorMsg);
                toast.error(errorMsg, {
                    description: errorDesc,
                    duration: 5000,
                });
                setTimeout(() => setErrorMessage(''), 5000);
            } finally {
                handleRequestCompletion();
            }
        };

        const getSession = async () => {
            try {
                const session = await supabase.auth.getSession();
                if (session.data.session) {
                    setEmail(session.data.session.user.email || null);
                    setErrorMessage(''); // Clear any previous error
                }
            } catch (error: any) {
                setErrorMessage('Failed to retrieve user session');
                toast.error('Session Error', {
                    description: 'Failed to retrieve user session. Please try logging in again.',
                    duration: 5000,
                });
                setTimeout(() => setErrorMessage(''), 5000);
            } finally {
                handleRequestCompletion();
            }
        };

        const fetchGymPlans = async () => {
            try {
                const response = await GetGymPlans(gymId);
                if (response?.data?.gymPlan) {
                    setSubscriptionPlans(response.data.gymPlan);
                    setErrorMessage(''); // Clear any previous error
                } else {
                    setSubscriptionPlans([]);
                    setErrorMessage('No subscription plans found for this gym');
                    toast.info('No Plans Available', {
                        description: 'No subscription plans found for this gym.',
                        duration: 5000,
                    });
                    setTimeout(() => setErrorMessage(''), 5000);
                }
            } catch (error: any) {
                let errorMsg = 'Failed to load subscription plans';
                let errorDesc = 'Please try again later.';
                if (error.response?.status === 404) {
                    errorMsg = 'Plans Not Found';
                    errorDesc = 'No subscription plans found for this gym.';
                } else if (error.response?.status === 400) {
                    errorMsg = 'Invalid Request';
                    errorDesc = 'The request contains invalid data.';
                } else if (error.response?.status === 401) {
                    errorMsg = 'Authentication Required';
                    errorDesc = 'Please log in to view subscription plans.';
                }
                setErrorMessage(errorMsg);
                toast.error(errorMsg, {
                    description: errorDesc,
                    duration: 5000,
                });
                setTimeout(() => setErrorMessage(''), 5000);
            } finally {
                handleRequestCompletion();
            }
        };

        getSession();
        fetchGymDetails();
        fetchGymPlans();
    }, [gymId]);

    const handleSubscribe = async (planId: string,duration:string) => {
        if (!email) {
            setSubscriptionErrorMessage('User email is not available yet');
            toast.error('Authentication Required', {
                description: 'Please log in to subscribe to membership plans.',
                duration: 5000,
            });
            setTimeout(() => setSubscriptionErrorMessage(''), 5000);
            return;
        }

        try {
            toast.loading('Processing your subscription...', {
                id: 'subscription-loading',
            });

            const customer_id = await getUserProfileId();
            if (!customer_id) {
                toast.dismiss('subscription-loading');
                setSubscriptionErrorMessage('Authentication failed');
                toast.error('Authentication Error', {
                    description: 'Unable to verify your account. Please try logging in again.',
                    duration: 5000,
                });
                setTimeout(() => setSubscriptionErrorMessage(''), 5000);
                return;
            }

            const result = await SubscribeGymPlan(
                planId,
                customer_id,
                email,
                gymData?.user_id,
                duration
            );

            toast.dismiss('subscription-loading');

            if (result.success && result.url) {
                // Redirect immediately to payment gateway
                window.location.assign(result.url);
            } else {
                let errorMessage = 'Subscription failed';
                let errorDescription = result.error || 'Unable to process your subscription request.';

                if (result.error?.includes('Stripe Account not found')) {
                    errorMessage = 'Payment Setup Incomplete';
                    errorDescription = 'This gym hasn\'t completed their payment setup yet. Please contact them directly or try again later.';
                } else if (result.error?.includes('Price ID not found')) {
                    errorMessage = 'Plan Unavailable';
                    errorDescription = 'This subscription plan is currently not available. Please try another plan or contact support.';
                } else if (result.status === 401) {
                    errorMessage = 'Authentication Required';
                    errorDescription = 'Please log in to subscribe to this plan.';
                } else if (result.status === 403) {
                    errorMessage = 'Access Denied';
                    errorDescription = 'You don\'t have permission to subscribe to this plan.';
                } else if (result.status === 409) {
                    errorMessage = 'Already Subscribed';
                    errorDescription = 'You already have an active subscription for this gym.';
                }

                setSubscriptionErrorMessage(errorMessage);
                toast.error(errorMessage, {
                    description: errorDescription,
                    duration: 6000,
                });
                setTimeout(() => setSubscriptionErrorMessage(''), 6000);
            }
        } catch (error: any) {
            toast.dismiss('subscription-loading');
            const errorMsg = 'Unexpected Error';
            const errorDesc = 'Something went wrong. Please try again or contact support.';
            
            setSubscriptionErrorMessage(errorMsg);
            toast.error(errorMsg, {
                description: errorDesc,
                duration: 5000,
            });
            setTimeout(() => setSubscriptionErrorMessage(''), 5000);
        }
    };

    // Scroll to plans section
    const handleViewPlans = () => {
        if (plansSectionRef.current) {
            const offset = 80; // Adjust for potential fixed header
            const elementPosition = plansSectionRef.current.getBoundingClientRect().top + window.pageYOffset;
            window.scrollTo({
                top: elementPosition - offset,
                behavior: 'smooth',
            });
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
                        <h3 className="text-xl font-semibold text-white">Loading Gym Profile</h3>
                        <p className="text-slate-400">Getting everything ready for you...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!gymData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <MapPin className="w-16 h-16 text-red-500 mx-auto" />
                    <h3 className="text-2xl font-semibold text-white">Gym Not Found</h3>
                    <p className="text-slate-300 max-w-md">No gym data found for the provided ID. Please check the ID or try again later.</p>
                </div>
            </div>
        );
    }

    // Default values if data is null or undefined
    const name = gymData.gym_name || 'Gym Name Not Available';
    const address = gymData.address || 'Address Not Available';
    const description = gymData.description || 'No description available for this gym.';
    const isVerified = gymData.verified ?? false;
    const ownerName = gymData.owner_name || 'Owner Not Available';
    const contactNo = gymData.contact_no || 'Contact No. Not Available';
    const profileImg = gymData.profile_img || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';

    const operatingHours = gymData.operating_Hours || {
        weekdays: 'Not Available',
        saturday: 'Not Available',
        sunday: 'Not Available'
    };

    const rating = 4.8;
    const totalReviews = 324;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900">
            {/* Hero Section */}
            <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
                {/* Background with Parallax Effect */}
                <div className="absolute inset-0">
                    <div 
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110 transition-transform duration-700 hover:scale-105"
                        style={{ 
                            backgroundImage: `url('${profileImg}')`,
                            filter: 'brightness(0.3) blur(0.5px)'
                        }} 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-red-900/30 to-slate-900/90" />
                    <div className="absolute inset-0 bg-gradient-to-r from-red-900/10 to-rose-900/10" />
                </div>

                {/* Animated Background Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

                {/* Hero Content */}
                <div className="relative z-10 text-center max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="space-y-8 animate-fade-in">
                        {/* Gym Name and Verification */}
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white leading-tight">
                                    <span className="bg-gradient-to-r from-white via-red-100 to-rose-100 bg-clip-text text-transparent">
                                        {name}
                                    </span>
                                </h1>
                                <Badge
                                    className={`flex items-center gap-2 px-5 py-3 text-base font-bold rounded-full transition-all duration-300 ${
                                        isVerified
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-green-100 border border-green-400/50 shadow-lg shadow-green-500/25'
                                            : 'bg-red-600 hover:bg-red-700 text-red-200 border border-red-400/50 shadow-lg shadow-red-500/25'
                                    }`}
                                >
                                    {isVerified ? (
                                        <>
                                            <Shield className="w-5 h-5 text-green-200" />
                                            Verified
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5 text-red-300" />
                                            Unverified
                                        </>
                                    )}
                                </Badge>
                            </div>

                            {/* Rating */}
                            <div className="flex items-center justify-center gap-6">
                                <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full border border-red-500/20">
                                    <div className="flex items-center gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <span className="font-bold text-xl text-white">{rating}</span>
                                    <span className="text-white/80">({totalReviews} reviews)</span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-lg sm:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed font-light">
                            {description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
                            <Button
                                onClick={handleViewPlans}
                                className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg shadow-red-500/25 transition-all duration-300 hover:scale-105"
                            >
                                <Navigation className="w-5 h-5 mr-2" />
                                View Plans
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
                {/* Error Messages */}
                {errorMessage && (
                    <Alert className="border-red-500/50 bg-red-500/10 backdrop-blur-sm text-red-100 shadow-lg">
                        <XCircle className="h-5 w-5 text-red-400" />
                        <AlertDescription className="text-red-200">{errorMessage}</AlertDescription>
                    </Alert>
                )}

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { 
                            icon: MapPin, 
                            title: 'Location', 
                            content: address,
                            gradient: 'from-red-500 to-rose-600',
                            bgGradient: 'from-red-500/20 to-rose-600/20'
                        },
                        { 
                            icon: Phone, 
                            title: 'Contact', 
                            content: contactNo,
                            gradient: 'from-red-500 to-pink-600',
                            bgGradient: 'from-red-500/20 to-pink-600/20'
                        },
                        { 
                            icon: User, 
                            title: 'Owner', 
                            content: ownerName,
                            gradient: 'from-rose-500 to-red-600',
                            bgGradient: 'from-rose-500/20 to-red-600/20'
                        },
                        {
                            icon: Clock,
                            title: 'Hours',
                            content: (
                                <div className="space-y-1 text-sm">
                                    <p><span className="font-medium">Mon-Fri:</span> {operatingHours.weekdays}</p>
                                    <p><span className="font-medium">Sat:</span> {operatingHours.saturday}</p>
                                    <p><span className="font-medium">Sun:</span> {operatingHours.sunday}</p>
                                </div>
                            ),
                            gradient: 'from-red-500 to-orange-600',
                            bgGradient: 'from-red-500/20 to-orange-600/20'
                        }
                    ].map((item, index) => (
                        <Card
                            key={index}
                            className="group bg-white/5 backdrop-blur-sm border-white/10 hover:border-red-500/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                            <CardContent className="relative p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${item.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-lg text-white mb-3 group-hover:text-red-100 transition-colors">
                                            {item.title}
                                        </h3>
                                        <div className="text-slate-300 group-hover:text-red-100 transition-colors">
                                            {item.content}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Map Section */}
                <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl text-white">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-red-500 to-rose-600 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            Location & Directions
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {parsedlocation ? (
                            <div className="relative overflow-hidden rounded-2xl">
                                <iframe
                                    width="100%"
                                    height="400"
                                    className="border-0 rounded-2xl"
                                    loading="lazy"
                                    allowFullScreen
                                    referrerPolicy="no-referrer-when-downgrade"
                                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''}&q=${parsedlocation.lat},${parsedlocation.lng}&zoom=15`}
                                />
                            </div>
                        ) : (
                            <div className="h-96 bg-slate-800/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-red-600/50">
                                <div className="text-center space-y-3">
                                    <MapPin className="w-12 h-12 text-red-500 mx-auto" />
                                    <p className="text-red-400 text-lg">Location not available</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Subscription Plans */}
                <div ref={plansSectionRef} className="space-y-8">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-5xl font-black text-white">
                            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
                                Membership Plans
                            </span>
                        </h2>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                            Choose the perfect plan for your fitness journey and start transforming your life today
                        </p>
                    </div>

                    {/* Success/Error Messages */}
                    {successMessage && (
                        <Alert className="border-green-500/50 bg-green-500/10 backdrop-blur-sm text-green-100 shadow-lg">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <AlertDescription className="text-green-200">{successMessage}</AlertDescription>
                        </Alert>
                    )}
                    {subscriptionErrorMessage && (
                        <Alert className="border-red-500/50 bg-red-500/10 backdrop-blur-sm text-red-100 shadow-lg">
                            <XCircle className="h-5 w-5 text-red-400" />
                            <AlertDescription className="text-red-200">{subscriptionErrorMessage}</AlertDescription>
                        </Alert>
                    )}

                    {subscriptionPlans.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {subscriptionPlans.map((plan, index) => {
                                const gradients = [
                                    'from-red-500 to-rose-600',
                                    'from-rose-500 to-pink-600',
                                    'from-pink-500 to-red-600',
                                    'from-red-500 to-orange-600',
                                    'from-orange-500 to-red-600'
                                ];
                                const gradient = gradients[index % gradients.length];
                                const isSubscribed = myPlans.includes(plan.plan_id);

                                return (
                                    <Card
                                        key={plan.plan_id}
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
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-lg font-medium">per {plan.duration}</span>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        
                                        <CardContent className="relative flex flex-col flex-grow space-y-6 p-6">
                                            <p className="text-slate-300 text-center leading-relaxed flex-grow group-hover:text-red-100 transition-colors">
                                                {plan.description}
                                            </p>
                                            {isSubscribed ? (
                                                <Button
                                                    disabled
                                                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-4 text-lg rounded-xl opacity-80"
                                                >
                                                    <CheckCircle className="w-5 h-5 mr-2" />
                                                    Subscribed
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => handleSubscribe(plan.plan_id,plan.duration)}
                                                    className={`w-full bg-gradient-to-r ${gradient} hover:shadow-xl hover:shadow-red-500/25 text-white font-bold py-4 text-lg rounded-xl transition-all duration-300 hover:scale-105 group-hover:shadow-2xl`}
                                                >
                                                    Subscribe Now
                                                </Button>
                                            )}
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                            <CardContent className="text-center py-16">
                                <div className="space-y-4">
                                    <Award className="w-16 h-16 text-red-500 mx-auto" />
                                    <h3 className="text-2xl font-semibold text-white">No Plans Available</h3>
                                    <p className="text-red-400 text-lg max-w-md mx-auto">
                                        This gym hasn't set up any membership plans yet. Please check back later or contact them directly.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
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

export default GymProfile;