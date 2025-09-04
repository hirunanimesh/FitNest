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

export const GymRegister = async (gymData) => {
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
export const GetTrainerById = async (trainerId) => {
    try {
        const response = await axios.get(`${Base_URL}/api/trainer/gettrainerbyid/${trainerId}`);
        return response.data;
    } catch (error) {
        console.error("Error getting trainer data:", error);
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            const newError = new Error(backendError.message || backendError.error || "Failed to fetch trainer data");
            newError.status = error.response.status;
            throw newError;
        }
        throw error;
    }
};

export const GetLatestWeight = async(customerId) =>{
    try{
        const response = await axios.get(`${Base_URL}/api/user/getlatestweightbyid/${customerId}`)
        if(!response){
            console.error("Error fetching data!")
        }
        return response.data
    }catch(error){
        console.log("GetLatestWeight error:", error.response?.status);
        // Handle 404 specifically - user might not have weight data yet
        if (error.response?.status === 404) {
            console.log("No weight data found for user:", customerId);
            return { weight: null }; // Return null weight instead of throwing
        }
        console.error("Error fetching latest weight data:", error)
        throw error; // Re-throw other errors
    }
}
export const GetWeight = async(customerId) =>{
    try{
        const response = await axios.get(`${Base_URL}/api/user/getweightbyid/${customerId}`)
        if(!response){
            console.error("Error fetching data!")
        }
        return response.data
    }catch(error){
        console.log("GetWeight error:", error.response?.status);
        // Handle 404 specifically - user might not have weight history yet
        if (error.response?.status === 404) {
            console.log("No weight history found for user:", customerId);
            return { weight: [] }; // Return empty array instead of throwing
        }
        console.error("Error fetching weight history data:", error)
        throw error; // Re-throw other errors
    }
}

export const UpdateUserDetails = async (customerId, userData) => {
    try {
        const config = {};
        let requestData;
        
        // Check if userData is FormData (contains file) or regular object
        if (userData instanceof FormData) {
            // If it's FormData, set the appropriate headers and use it directly
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
            requestData = userData;
        } else {
            // If it's regular object data, transform it to the expected format
            const payload = {};
            if (userData.firstName) payload.first_name = userData.firstName;
            if (userData.lastName) payload.last_name = userData.lastName;
            if (userData.phone) payload.phone_no = userData.phone;
            if (userData.address) payload.address = userData.address;
            if (userData.dateOfBirth) payload.birthday = userData.dateOfBirth;
            if (userData.gender) payload.gender = userData.gender;
            if (userData.avatar) payload.profile_img = userData.avatar;
            requestData = payload;
        }

        const response = await axios.patch(
            `${Base_URL}/api/user/updateuserdetails/${customerId}`,
            requestData,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error updating user details:", error);
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            const newError = new Error(backendError.message || backendError.error || "Failed to update user details");
            newError.status = error.response.status;
            throw newError;
        }
        throw error;
    }
};

// Session API functions
export const AddSession = async (sessionData) => {
    try {
        const response = await axios.post(`${Base_URL}/api/trainer/addsession`, sessionData);
        return response.data;
    } catch (error) {
        console.error("Error adding session:", error);
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            const newError = new Error(backendError.message || backendError.error || "Failed to create session");
            newError.status = error.response.status;
            throw newError;
        }
        throw error;
    }
};
export const UpdateSessionDetails = async (sessionId, sessionData) => {
    try {
        const config = {};
        let requestData;

        // Check if sessionData is FormData (contains file) or regular object
        if (sessionData instanceof FormData) {
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
            requestData = sessionData;
        } else {
            // Map only relevant session fields
            const payload = {};
            if (sessionData.title) payload.title = sessionData.title;
            if (sessionData.description) payload.description = sessionData.description;
            if (sessionData.price) payload.price = sessionData.price;
            if (sessionData.duration) payload.duration = sessionData.duration;
            if (sessionData.trainerId) payload.trainer_id = sessionData.trainerId;
            if (sessionData.zoom_link) payload.zoom_link = sessionData.zoom_link;
            if (sessionData.img_url) payload.img_url = sessionData.img_url; // <-- FIXED
            if (sessionData.time) payload.time = sessionData.time;
            if (sessionData.date) payload.date = sessionData.date;
            // Add other session fields as needed
            requestData = payload;
        }

        const response = await axios.patch(
            `${Base_URL}/api/trainer/updatesession/${sessionId}`,
            requestData,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error updating session details:", error);
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            const newError = new Error(backendError.message || backendError.error || "Failed to update session details");
            newError.status = error.response.status;
            throw newError;
        }
        throw error;
    }
};