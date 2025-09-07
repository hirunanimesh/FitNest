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
export const DeleteSession = async (sessionId) => {
    try {
        await axios.delete(`${Base_URL}/api/trainer/deletesession/${sessionId}`);
        // Do not show toast here; handle it in the component
    } catch (error) {
        console.error('Error deleting session:', error);
        throw error;
    }
};
export const UpdateTrainerDetails = async (trainerId, trainerData) => {
    try {
        const config = {};
        let requestData;
        
        // Check if trainerData is FormData (contains file) or regular object
        if (trainerData instanceof FormData) {
            // If it's FormData, set the appropriate headers and use it directly
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
            requestData = trainerData;
        } else {
            // If it's regular object data, transform it to the expected format
            const payload = {};
            if (trainerData.Name) payload.trainer_name = trainerData.Name;
            if (trainerData.years_of_experience) payload.years_of_experience = trainerData.years_of_experience;
            if (trainerData.contact_no) payload.contact_no = trainerData.contact_no;
            if (trainerData.bio) payload.bio = trainerData.bio;
            if (trainerData.skills) payload.skills = trainerData.skills;
            if (trainerData.profile_img) payload.profile_img = trainerData.profile_img;
            requestData = payload;
        }

        const response = await axios.patch(
            `${Base_URL}/api/trainer/updatetrainerdetails/${trainerId}`,
            requestData,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error updating trainer details:", error);
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            const newError = new Error(backendError.message || backendError.error || "Failed to update user details");
            newError.status = error.response.status;
            throw newError;
        }
        throw error;
    }
};

export const uploadToCloudinary = async (file) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    try {
        // Choose endpoint according to file type. Use 'image/upload' for images and 'raw/upload' for others (e.g., pdf).
        const isImage = typeof file?.type === 'string' && file.type.startsWith('image');
        const endpoint = isImage
            ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
            : `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

        const response = await axios.post(
            endpoint,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                timeout: 60000,
            }
        );

        // raw/upload returns 'secure_url' as well for raw files
        return response.data.secure_url || response.data.url;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        if (error.response?.data?.error?.message) {
            throw new Error(error.response.data.error.message);
        }
        throw new Error("File upload failed");
    }
}
export const AddPlan = async (planData) => {
    try {
        const response = await axios.post(`${Base_URL}/api/trainer/addplan`, planData);
        return response.data;
    } catch (error) {
        console.error("Error adding plan:", error);
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            const newError = new Error(backendError.message || backendError.error || "Failed to create plan");
            newError.status = error.response.status;
            throw newError;
        }
        throw error;
    }
};
export const UpdatePlan = async (planId, planData) => {
    try {
        const config = {};
        let requestData;

        // Check if planData is FormData (contains file) or regular object
        if (planData instanceof FormData) {
            // If there's an image file in the FormData, upload it and replace with img_url
            const imgFile = planData.get('image') || planData.get('img') || planData.get('img_url') || planData.get('photo');
            if (imgFile && typeof imgFile !== 'string') {
                try {
                    const uploadedUrl = await uploadToCloudinary(imgFile);
                    planData.delete('image');
                    planData.delete('img');
                    planData.delete('photo');
                    planData.set('img_url', uploadedUrl);
                } catch (err) {
                    console.error('Image upload failed in UpdatePlan:', err);
                }
            }

            const pdfFile = planData.get('instructionPdf') || planData.get('instruction_pdf');
            if (pdfFile && typeof pdfFile !== 'string') {
                try {
                    const pdfUrl = await uploadToCloudinary(pdfFile);
                    planData.delete('instructionPdf');
                    planData.delete('instruction_pdf');
                    planData.set('instruction_pdf', pdfUrl);
                } catch (err) {
                    console.error('PDF upload failed in UpdatePlan:', err);
                }
            }
            config.headers = {
                'Content-Type': 'multipart/form-data',
            };
            requestData = planData;
        } else {
            // Map only relevant plan fields
            const payload = {};
            if (planData.title) payload.title = planData.title;
            if (planData.description) payload.description = planData.description;
            if (planData.img_url) payload.img_url = planData.img_url; 
            // support both snake_case and camelCase keys for instruction PDF
            if (planData.instruction_pdf) payload.instruction_pdf = planData.instruction_pdf;
            
            requestData = payload;
        }

        const response = await axios.patch(
            `${Base_URL}/api/trainer/updateplan/${planId}`,
            requestData,
            config
        );
        return response.data;
    } catch (error) {
        console.error("Error updating plan details:", error);
        if (error.response && error.response.data) {
            const backendError = error.response.data;
            const newError = new Error(backendError.message || backendError.error || "Failed to update plan details");
            newError.status = error.response.status;
            throw newError;
        }
        throw error;
    }
};
export const DeletePlan = async (planId) => {
    try {
        await axios.delete(`${Base_URL}/api/trainer/deleteplan/${planId}`);
        // Do not show toast here; handle it in the component
    } catch (error) {
        console.error('Error deleting plan:', error);
        throw error;
    }
};
