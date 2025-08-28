import axios from "axios"

const Base_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const GetDashboardLink = async(id: any) =>{
    const response = await axios.get(`${Base_URL}/api/payment/stripedashboard/${id}`)
    console.log(response)
    return response
}

export const CreateAccount = async(id:any) => {
    const response = await axios.get(`${Base_URL}/api/payment/create-account/${id}`)
    return response
}

export const GetTrainers = async(gymId:any) => {
    const response = await axios.get(`${Base_URL}/api/gym/gettrainers/${gymId}`)
    return response
}

export const ApproveTrainer = async(request_id:any) => {
    const response = await axios.put(`${Base_URL}/api/gym/approvetrainer/${request_id}`)
    return response
}

export const GetGymPlans = async(gymId:any) => {
    const response = await axios.get(`${Base_URL}/api/gym/getgymplanbygymid/${gymId}`)
    return response
}

export const GetPaymentHistory = async(userId:any) => {
    const response = await axios.get(`${Base_URL}/api/payment/connectedaccountpayments/${userId}`)
    return response
}

export const GetStatistics = async(gymId:any) => {
    const response = await axios.get(`${Base_URL}/api/gym/getstatistics/${gymId}`)
    return response
}

export const GetMonthlyRevenue = async(userId:any) => {
    const response = await axios.get(`${Base_URL}/api/payment/monthlyrevenue/${userId}`)
    return response
}

// New functions for gym plan management with trainers

export const CreateGymPlan = async(gymId: any, planData: any) => {
    const response = await axios.post(`${Base_URL}/api/gym/addgymplan`, {
        ...planData,
        gym_id: gymId
    })
    return response
}

export const UpdateGymPlan = async(planId: any, planData: any) => {
    const response = await axios.put(`${Base_URL}/api/gym/updategymplan/${planId}`, planData)
    return response
}

export const DeleteGymPlan = async(planId: any) => {
    const response = await axios.delete(`${Base_URL}/api/gym/deletegymplan/${planId}`)
    return response
}

export const AssignTrainersToPlan = async(planId: any, trainerIds: string[]) => {
    const response = await axios.post(`${Base_URL}/api/gym/assign-trainers-to-plan`, {
        plan_id: planId,
        trainer_ids: trainerIds
    })
    return response
}

export const UpdatePlanTrainers = async(planId: any, trainerIds: string[]) => {
    const response = await axios.put(`${Base_URL}/api/gym/update-plan-trainers/${planId}`, {
        trainer_ids: trainerIds
    })
    return response
}

export const GetPlanTrainers = async(planId: any) => {
    const response = await axios.get(`${Base_URL}/api/gym/get-plan-trainers/${planId}`)
    return response
}