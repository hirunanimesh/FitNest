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