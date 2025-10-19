"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { GetTrainers, ApproveTrainer } from '@/api/gym/route';
import { useGym } from '../context/GymContext';

interface Trainer {
    id: string | number;
    name: string;
    role: string;
    email: string;
    verified: boolean;
    skills: string[];
    rating: number;
    years_of_experience: number;
    profile_img: string | null;
    approved: boolean;
    request_id: string | number;
}

interface TrainerAPIResponse {
    data: {
        trainers_data: Array<{
            trainer: {
                id: string | number;
                trainer_name: string;
                contact_no: string;
                verified: boolean;
                skills: string;
                rating: number;
                years_of_experience: number;
                profile_img: string | null;
            };
            approved: boolean;
            request_id: string | number;
        }>;
    };
}

interface LoadingStates {
    [key: string]: boolean;
}

const TrainerTab: React.FC = () => {
    const router = useRouter();
    const [filteredProfiles, setFilteredProfiles] = useState<Trainer[]>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [filterType, setFilterType] = useState<string>("all");
    const [successMessage, setSuccessMessage] = useState<string>("");
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [loadingStates, setLoadingStates] = useState<LoadingStates>({});
    const [loading, setLoading] = useState<boolean>(true); // Loader for fetching trainers
    const { gymId } = useGym();

    useEffect(() => {
        const loadTrainers = async (): Promise<void> => {
            setLoading(true);
            try {
                const response: TrainerAPIResponse = await GetTrainers(gymId);
                const trainerData: Trainer[] = response.data.trainers_data.map(item => ({
                    id: item.trainer.id,
                    name: item.trainer.trainer_name,
                    role: "Trainer",
                    email: item.trainer.contact_no,
                    verified: item.trainer.verified,
                    skills: item.trainer.skills.replace(/[{}]/g, '').split(', ').filter(skill => skill.trim() !== ''),
                    rating: item.trainer.rating,
                    years_of_experience: item.trainer.years_of_experience,
                    profile_img: item.trainer.profile_img,
                    approved: item.approved,
                    request_id: item.request_id,
                }));
                setTrainers(trainerData);
                setFilteredProfiles(trainerData);
            } catch (error) {
                console.error('Error fetching trainers:', error);
                setErrorMessage('Failed to load trainers. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        if (gymId) loadTrainers();
    }, [gymId]);

    useEffect(() => {
        let updatedProfiles = trainers.filter((profile) =>
            profile.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (filterType === "my") updatedProfiles = updatedProfiles.filter((profile) => profile.approved);
        else if (filterType === "other") updatedProfiles = updatedProfiles.filter((profile) => !profile.approved);

        setFilteredProfiles(updatedProfiles);
    }, [searchQuery, trainers, filterType]);

    const handleApprove = async (requestId: string | number, trainerName: string): Promise<void> => {
        const requestIdString = String(requestId);
        setLoadingStates(prev => ({ ...prev, [requestIdString]: true }));
        setErrorMessage("");

        try {
            await ApproveTrainer(requestId);
            setTrainers((prevTrainers) =>
                prevTrainers.map((trainer) =>
                    trainer.request_id === requestId ? { ...trainer, approved: true } : trainer
                )
            );
            setSuccessMessage(`${trainerName} has been successfully approved!`);
            setTimeout(() => setSuccessMessage(""), 5000);
        } catch (error) {
            console.error('Error approving trainer:', error);
            setErrorMessage(`Failed to approve ${trainerName}. Please try again.`);
            setTimeout(() => setErrorMessage(""), 5000);
        } finally {
            setLoadingStates(prev => ({ ...prev, [requestIdString]: false }));
        }
    };

    const trainerProfiles = filteredProfiles.filter((profile) => profile.role === "Trainer");

    return (
        <div className='animate-fade-in'>
            <Card className='bg-gray-800 text-white'>
                <CardHeader>
                    <CardTitle>Trainers Management</CardTitle>
                    <CardDescription className='text-gray-300'>View and manage gym trainers</CardDescription>
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

                    <div className='flex flex-row gap-5 mb-4'>
                        <div className="flex items-center space-x-2">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search trainers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="max-w-sm text-gray-800"
                            />
                        </div>
                        <Select onValueChange={setFilterType} defaultValue="all">
                            <SelectTrigger className="w-[180px] text-gray-600">
                                <SelectValue placeholder="Filter Trainers" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Trainers</SelectItem>
                                <SelectItem value="my">My Trainers</SelectItem>
                                <SelectItem value="other">Applications</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Loader */}
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-red-500"></div>
                        </div>
                    ) : trainerProfiles.length === 0 ? (
                        <p className="text-gray-300 text-center mt-4">No trainers found</p>
                    ) : (
                        <>
                            {/* Mobile View */}
                            <div className="block md:hidden">
                                <div className="space-y-4">
                                    {trainerProfiles.map((profile) => (
                                        <Card
                                            key={profile.id}
                                            onClick={() => router.push(`/profile/trainer?id=${profile.id}`)}
                                            className="bg-gray-700 border-gray-600 cursor-pointer"
                                        >
                                            <CardContent className="p-4">
                                                <div className="flex items-start space-x-4">
                                                    <Avatar className="h-12 w-12">
                                                        {profile.profile_img ? (
                                                            <AvatarImage src={profile.profile_img} alt={profile.name} />
                                                        ) : (
                                                            <AvatarFallback className="bg-gray-600 text-white">
                                                                {profile.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="font-medium text-white truncate">{profile.name}</h3>
                                                            {profile.verified ? (
                                                                <Badge className='bg-green-500 hover:bg-green-600 text-xs'>Verified</Badge>
                                                            ) : (
                                                                <Badge variant="secondary" className='bg-yellow-600 hover:bg-yellow-700 text-xs'>Not Verified</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-300 mb-2">{profile.email}</p>
                                                        <div className="flex items-center mb-3">
                                                            <span className="text-sm text-gray-300">⭐ {profile.rating}</span>
                                                        </div>
                                                        {!profile.approved && (
                                                            <Button
                                                                variant="default"
                                                                size="sm"
                                                                onClick={(e) => { e.stopPropagation(); handleApprove(profile.request_id, profile.name); }}
                                                                disabled={loadingStates[String(profile.request_id)]}
                                                            >
                                                                Approve
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* Desktop View */}
                            <div className="hidden md:block overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className='text-gray-300'>Profile</TableHead>
                                            <TableHead className='text-gray-300'>Name</TableHead>
                                            <TableHead className='text-gray-300 hidden lg:table-cell'>Contact</TableHead>
                                            <TableHead className='text-gray-300'>Status</TableHead>
                                            <TableHead className='text-gray-300'>Rating</TableHead>
                                            <TableHead className='text-gray-300 hidden lg:table-cell'>Experience</TableHead>
                                            <TableHead className='text-gray-300'>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {trainerProfiles.map((profile) => (
                                            <TableRow
                                                key={profile.id}
                                                className="hover:bg-gray-700/50 cursor-pointer"
                                                onClick={() => router.push(`/profile/trainer?id=${profile.id}`)}
                                            >
                                                <TableCell>
                                                    <Avatar className="h-10 w-10">
                                                        {profile.profile_img ? (
                                                            <AvatarImage src={profile.profile_img} alt={profile.name} />
                                                        ) : (
                                                            <AvatarFallback className="bg-gray-600 text-white">
                                                                {profile.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                </TableCell>
                                                <TableCell className="font-medium text-white">{profile.name}</TableCell>
                                                <TableCell className="text-gray-300 hidden lg:table-cell">{profile.email}</TableCell>
                                                <TableCell>
                                                    {profile.verified ? (
                                                        <Badge className='bg-green-500 hover:bg-green-600 text-xs'>Verified</Badge>
                                                    ) : (
                                                        <Badge variant="secondary" className='bg-yellow-600 hover:bg-yellow-700 text-xs text-white'>Not Verified</Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-gray-300 flex items-center">
                                                    <span className="text-yellow-400 mr-1">⭐</span>{profile.rating}
                                                </TableCell>
                                                <TableCell className="text-gray-300 hidden lg:table-cell">{profile.years_of_experience} years</TableCell>
                                                <TableCell>
                                                     {!profile.approved ? (
                                                         <Button
                                                             variant="default"
                                                             size="sm"
                                                             onClick={(e) => { e.stopPropagation(); handleApprove(profile.request_id, profile.name); }}
                                                             disabled={loadingStates[String(profile.request_id)]}
                                                         >
                                                             Approve
                                                         </Button>
                                                     ) : (
                                                         <Badge className='bg-blue-500 hover:bg-blue-600 text-xs'>Approved</Badge>
                                                     )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default TrainerTab;
