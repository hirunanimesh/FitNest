import axios from 'axios';

const Base_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const AddCustomer = async (customerData) => {
    try {
        // Check if customerData is FormData (contains file) or regular object
        const config = {};
        
        if (customerData instanceof FormData) {
            // If it's FormData, set the appropriate headers
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }

        const response = await axios.post(`${Base_URL}/api/auth/customer/register`, customerData, config);
        return response.data;
    } catch (error) {
        console.error("Error adding customer:", error);
        throw error;
    }
};

export const LoginUser = async (email, password) => {
    try {
        const response = await axios.post(`${Base_URL}/api/auth/login`, {
            email,
            password,
        });
        return response.data;
    } catch (error) {
        console.error("Error logging in user:", error);
        throw error;
    }
};

export const GetUserInfo = async (token) => {
    try {
        const response = await axios.get(`${Base_URL}/api/auth/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error getting user info:", error);
        throw error;
    }
};

export const CompleteOAuthProfileMember = async (profileData) => {
    try {
        const config = {};
        
        if (profileData instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }

        const response = await axios.post(`${Base_URL}/api/auth/oauth/complete-profile`, profileData, config);
        return response.data;
    } catch (error) {
        console.error("Error completing OAuth profile:", error);
        // If it's an axios error with response data, preserve the response structure
        if (error.response && error.response.data) {
            throw error; // Re-throw the full error so frontend can access error.response.data
        }
        throw error;
    }
};

export const TrainerRegister = async (trainerData) => {
    console.log("Trainer data being sent:", trainerData); // Debug log
    try {
        const config = {};

        if (trainerData instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }

        const response = await axios.post(`${Base_URL}/api/auth/trainer/register`, trainerData, config);
        return response.data;
    } catch (error) {
        console.error("Error registering trainer:", error);
        throw error;
    }
};

export const CompleteOAuthProfileTrainer = async (profileData) => {
    try {
        const config = {};
        
        if (profileData instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }

        const response = await axios.post(`${Base_URL}/api/auth/oauth/complete-profile-trainer`, profileData, config);
        return response.data;
    } catch (error) {
        console.error("Error completing OAuth trainer profile:", error);
        // If it's an axios error with response data, preserve the response structure
        if (error.response && error.response.data) {
            throw error; // Re-throw the full error so frontend can access error.response.data
        }
        throw error;
    }
};
