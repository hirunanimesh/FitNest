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
        
        // Extract error message from axios response
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            // Create a new error with the backend message and preserve the code
            const newError = new Error(backendError.message || backendError.error || "Registration failed");
            newError.code = backendError.code;
            newError.status = error.response.status;
            throw newError;
        }
        
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

export const GetCustomerById = async (customerId) => {
    try {
        const response = await axios.get(`${Base_URL}/api/user/getuserbyid/${customerId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting customer data:", error);
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            const newError = new Error(backendError.message || backendError.error || "Failed to fetch customer data");
            newError.status = error.response.status;
            throw newError;
        }
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
        
        // Extract error message from axios response
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            // Create a new error with the backend message and preserve the code
            const newError = new Error(backendError.message || backendError.error || "Registration failed");
            newError.code = backendError.code;
            newError.status = error.response.status;
            throw newError;
        }
        
        throw error;
    }
};

export const 
GymRegister = async (gymData) => {
    console.log("Gym data being sent:", gymData); // Debug log
    try {
        const config = {};

        if (gymData instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }

        const response = await axios.post(`${Base_URL}/api/auth/gym/register`, gymData, config);
        return response.data;
    } catch (error) {
        console.error("Error registering gym:", error);
        
        // Extract error message from axios response
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            // Create a new error with the backend message and preserve the code
            const newError = new Error(backendError.message || backendError.error || "Registration failed");
            newError.code = backendError.code;
            newError.status = error.response.status;
            throw newError;
        }
        
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

export const CompleteOAuthProfileGym = async (profileData) => {
    try {
        const config = {};
        
        if (profileData instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
        }

        const response = await axios.post(`${Base_URL}/api/auth/oauth/complete-profile-gym`, profileData, config);
        return response.data;
    } catch (error) {
        console.error("Error completing OAuth gym profile:", error);
        // If it's an axios error with response data, preserve the response structure
        if (error.response && error.response.data) {
            throw error; // Re-throw the full error so frontend can access error.response.data
        }
        throw error;
    }
};

export const GetGymProfileData = async(id) =>{
    try{
        const response = await axios.get(`${Base_URL}/api/gym/getgymbyuserid/${id}`)
        if(!response){
            console.error("Error fetching data!")
        }
        return response.data
    }catch(error){
        console.error("Error fetching gym data",error)
    }
}
