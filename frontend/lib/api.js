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
    