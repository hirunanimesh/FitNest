import axios from "axios"

const Base_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

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

