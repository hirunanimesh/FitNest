import axios from "axios"

const Base_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';


export const GetGymDetails = async(gymId:any) => {
    const response = await axios.get(`${Base_URL}/api/gym/getgymbyid/${gymId}`)
    return response
}

export const GetGymPlans = async(gymId:any) => {
    const response = await axios.get(`${Base_URL}/api/gym/getgymplanbygymid/${gymId}`)
    return response
}
export const GetOneDayGyms = async() => {
    try {
        const response = await axios.get(`${Base_URL}/api/gym/one-day`);
        return response.data;
    } catch (error) {
        console.error("Error fetching one day gyms:", error);
        throw error;
    }
};

export const GetOtherGyms = async() => {
    try {
        const response = await axios.get(`${Base_URL}/api/gym/other`);
        return response.data;
    } catch (error) {
        console.error("Error fetching other gyms:", error);
        throw error;
    }
};

export const SubscribeGymPlan = async (planId: any, customerId: any, email: any, user_id: any) => {
    try {
        const response = await axios.post(`${Base_URL}/api/payment/subscribe`, {
            planId,
            customer_id: customerId,
            user_id,
            email
        });

        // If we reach here, the request was successful
        return { success: true, url: response.data.url };

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
    const planIds = await axios.get(`${Base_URL}/api/payment/getsubscription/${customerId}`)
    if(planIds.data.length === 0){
        return []
    }
    return planIds.data
}


