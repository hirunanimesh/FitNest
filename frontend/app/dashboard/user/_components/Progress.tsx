"use client";
import React from 'react'
import { Card, CardContent } from "@/components/ui/card";
import { Weight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Ruler, Activity } from 'lucide-react';
import { supabase } from "@/lib/supabase";
import {  GetUserInfo } from "@/lib/api"
import axios from 'axios';

interface ProgressEntry {
    date: string;
    weight: number;
    height: number;
 }

const Progress = () => {
    const [profileId, setProfileId] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(null);
    const [weightData, setWeightData] = useState<number |null >(null);
    const [heightData, setHeightData] = useState<number |null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAllData() {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            const token = session?.access_token;
            if (!token) return;

            try {
                const data = await GetUserInfo(token);
                const profileId = data?.user?.id || null;
                setProfileId(profileId);

                if (profileId) {
                    const { data: customerData, error } = await supabase
                        .from("customer")
                        .select("id")
                        .eq("user_id", profileId)
                        .single();

                    if (error) {
                        setCustomerId(null);
                        setWeightData(null);
                        setHeightData(null);
                        setLoading(false);
                        return;
                    } else {
                        setCustomerId(customerData?.id);

                        try {
                            const response = await axios.get(
                                `${process.env.NEXT_PUBLIC_API_GATEWAY_URL}/api/user/getlatestweightbyid/28` //${customerData?.id}
                            );
                            if (response.data) {
                                setWeightData(response.data.weight.weight);
                                setHeightData(response.data.weight.height);
                            }
                        } catch (error) {
                            setWeightData(null);
                            setHeightData(null);
                        }
                    }
                }
            } catch (error) {
                setCustomerId(null);
                setWeightData(null);
                setHeightData(null);
            }
            setLoading(false);
        }

        fetchAllData();
    }, []);

    return (
        <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-start">
                <Card>
                    <CardContent className="p-6 bg-black">
                        <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground text-blue-500">Weight</p>
                                <p className="text-2xl font-bold text-blue-500">
                                    {loading ? "--" : weightData !== null ? `${weightData} kg` : "N/A"}
                                </p>
                            </div>
                            <Weight className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 bg-black">
                        <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                            <div>
                                <p className="text-sm text-muted-foreground">Height</p>
                                <p className="text-2xl font-bold text-green-500">
                                    {loading ? "--" : heightData !== null ? `${heightData} m` : "N/A"}
                                </p>
                            </div>
                            <Ruler className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6 bg-black">
                    <div className="flex items-center justify-between p-4 border border-red-500 rounded-lg">
                        <div>
                        <p className="text-sm text-muted-foreground">BMI</p>
                        <p className="text-2xl font-bold text-purple-500">24.0</p>
                        <p className="text-xs text-muted-foreground">Normal range</p>
                        </div>
                        <Activity className="h-8 w-8 text-purple-500" />
                    </div>
                    </CardContent>
                </Card>
                
    </div>
    </div>
  )
}




export default Progress
