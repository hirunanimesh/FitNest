import axios from "axios"
import { pl } from "date-fns/locale";
import { getAuthHeaders } from "@/lib/auth";

const Base_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';


export const GetGymDetails = async(gymId:any) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${Base_URL}/api/gym/getgymbyid/${gymId}`, { headers })
    return response
}

export const GetGymPlans = async(gymId:any) => {
    const headers = await getAuthHeaders();
    const response = await axios.get(`${Base_URL}/api/gym/getgymplanbygymid/${gymId}`, { headers })
    return response
}
export const GetOneDayGyms = async() => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${Base_URL}/api/gym/one-day`, { headers });
        return response.data;
    } catch (error) {
        console.error("Error fetching one day gyms:", error);
        throw error;
    }
};

export const GetOtherGyms = async() => {
    try {
        const headers = await getAuthHeaders();
        const response = await axios.get(`${Base_URL}/api/gym/other`, { headers });
        return response.data;
    } catch (error) {
        console.error("Error fetching other gyms:", error);
        throw error;
    }
};

export const SubscribeGymPlan = async (planId: any, customerId: any, email: any, user_id: any,duration:any) => {
    try {
        const headers = await getAuthHeaders();
        if(duration === "1 day"){
            const response = await axios.post(`${Base_URL}/api/payment/onetimepayment`, {
                planId,
                customer_id: customerId,
                user_id,
                email
            }, { headers });
        return { success: true, url: response.data.url };

        }else{
            const response = await axios.post(`${Base_URL}/api/payment/subscribe`, {
                planId,
                customer_id: customerId,
                user_id,
                email
            }, { headers });
            return { success: true, url: response.data.url };
        }
       

    } catch (error: any) {
        // Handle different types of errors
        if (error.response) {
            // Server responded with error status (4xx, 5xx)
            const status = error.response.status;
            const message = error.response.data?.error || error.response.data?.message || 'Unknown error occurred';

            return {
                success: false,
                error: message,
                status: status
            };
        } else if (error.request) {
            // Network error - request was made but no response received
            return {
                success: false,
                error: 'Network error: Please check your internet connection',
                status: 0
            };
        } else {
            // Other error
            return {
                success: false,
                error: error.message || 'An unexpected error occurred',
                status: 0
            };
        }
    }
};


export const GetUserSubscriptions = async (customerId:any) =>{
    const headers = await getAuthHeaders();
    const planIds = await axios.get(`${Base_URL}/api/payment/getsubscription/${customerId}`, { headers })

    if(planIds.data.length === 0){
        return []
    }
    return planIds.data
}

export const GetMyPlansDetails = async (planIds:any[])=>{
    try {
        const headers = await getAuthHeaders();
        
        // Check if we have authentication headers
        if (!headers.Authorization) {
            throw new Error('User not authenticated. Please log in to continue.');
        }
        
        console.log('🔍 Debug GetMyPlansDetails:');
        console.log('Headers:', headers);
        console.log('Base_URL:', Base_URL);
        console.log('PlanIds:', planIds);
        
        const plans = await axios.post(`${Base_URL}/api/gym/getgymplandetails`,{
            planIds:planIds
        }, { headers })
        
        console.log('✅ Success response:', plans.data);
        return plans.data
    } catch (error: any) {
        console.error('❌ Error in GetMyPlansDetails:', error);
        
        // Handle different types of errors
        if (error.response?.status === 401) {
            throw new Error('Authentication failed. Please log in again.');
        } else if (error.response?.status === 403) {
            throw new Error('Access denied. You do not have permission to access this resource.');
        } else if (error.message?.includes('not authenticated')) {
            throw new Error('User not authenticated. Please log in to continue.');
        } else if (error.code === 'ECONNREFUSED' || error.message === 'Network Error') {
            throw new Error('Unable to connect to server. Please try again later.');
        }
        
        console.error('Error message:', error.message);
        console.error('Error response:', error.response?.data);
        console.error('Error status:', error.response?.status);
        throw error;
    }
}

export const UnsubscribeGymPlan = async (planId:any, customerId:any) => {
    const headers = await getAuthHeaders();
    const response = await axios.post(`${Base_URL}/api/payment/cancel-subscription`,{
        planId,
        customerId
    }, { headers })
    return response.data
}

export const BookSession = async (sessionId:any, customerId:any,user_id:string,email:string)=>{
    console.log("frontend api called", sessionId, customerId, user_id,email);
    const headers = await getAuthHeaders();
    const response = await axios.post(`${Base_URL}/api/payment/sessionpayment`,{
        sessionId,
        customer_id: customerId,
        user_id,
        email
    }, { headers })
    return response.data
}

export const GetUserSessions = async (customerId:any)=>{
    const headers = await getAuthHeaders();
    const response = await axios.get(`${Base_URL}/api/user/mysessions/${customerId}`, { headers })
    return response.data
}

