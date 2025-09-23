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

export const GetGymCustomerIds = async(gymPlans:any[])=>{
    console.log("Gym Plans in API Call",gymPlans)
    const customerIds = await axios.post(`${Base_URL}/api/payment/getgymcustomerids`,{
        gymPlans: gymPlans
    })
    return customerIds
}

export const GetAllGymCustomers = async(customerIds:string[])=>{
    console.log("Customer Ids in API Call",customerIds)
    const customers = await axios.post(`${Base_URL}/api/gym/getallgymusers`,{
        customerIds: customerIds
    })
    return customers
}

export const RequestVerification = async(gym_id:any,email:string) => {
  const response =  await fetch(`${Base_URL}/api/gym/request-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gym_id: gym_id, // Use gym_id if available, otherwise userId
          type: 'gym',
          status: 'pending',
          email: email
        })
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Verification request failed');
      }

      return result;
}

export const GetMonthlyMembers = async(gymPlans:any[])=>{
    const response = await axios.post(`${Base_URL}/api/payment/monthlymembers`,{
        gymPlans
    })
    return response
}