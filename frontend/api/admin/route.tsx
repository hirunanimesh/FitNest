import axios from "axios"
import { getAuthHeaders } from "@/lib/auth"

//const ADMIN_SERVICE_URL = process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL || 'http://localhost:3006';
const Base_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const UploadDocuments = async (documents: string[], metadata: any[]) => {
    console.log("in the upload documents API", { documents, metadata })
    const headers = await getAuthHeaders()
    const response = await axios.post(`${Base_URL}/api/admin/documents/upload`, { 
        documents, 
        metadata 
    }, { headers })
    return response
}

export const FetchDocuments = async (page: number = 1, limit: number = 10) => {
    console.log("in the fetch documents API", { page, limit })
    const headers = await getAuthHeaders()
    const response = await axios.get(`${Base_URL}/api/admin/documents`, {
        params: { page, limit },
        headers
    })
    return response
}

export const SearchDocuments = async (query: string, limit: number = 10) => {
    console.log("in the search documents API", { query, limit })
    const headers = await getAuthHeaders()
    const response = await axios.get(`${Base_URL}/api/admin/documents/search`, {
        params: { query, limit },
        headers
    })
    return response
}

export const DeleteDocument = async (documentId: string) => {
    console.log("in the delete document API", { documentId })
    const headers = await getAuthHeaders()
    const response = await axios.delete(`${Base_URL}/api/admin/documents/${documentId}`, { headers })
    return response
}

export const ChatWithAI = async (question: string) => {
    console.log("in the chat API", { question })
    const headers = await getAuthHeaders()
    const response = await axios.post(`${Base_URL}/api/admin/chat`, {
        question
    }, { headers })
    return response
}

export const GetChatHealth = async () => {
    console.log("checking chat health")
    const headers = await getAuthHeaders()
    const response = await axios.get(`${Base_URL}/api/admin/chat/health`, { headers })
    return response
}

export const MemberGrowth = async (startDate?: string, endDate?: string) => {
    console.log("fetching member growth data", { startDate, endDate })
    const headers = await getAuthHeaders()
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await axios.get(`${Base_URL}/api/admin/stats/member-growth`, {
        params,
        headers
    })
    return response
}

export const GetDashboardStats = async () => {
    console.log("fetching dashboard stats")
    const headers = await getAuthHeaders()
    const response = await axios.get(`${Base_URL}/api/admin/dashboard/stats`, { headers })
    return response
}

export const GetSystemRevenue = async () => {
    console.log("fetching system revenue")
    const headers = await getAuthHeaders()
    // Expecting the API gateway to proxy to payment service /getsystemrevenue
    const response = await axios.get(`${Base_URL}/api/payment/getsystemrevenue`, { headers })
    return response
}

export const GetTrainerVerifications = async () => {
    console.log("fetching trainer verifications")
    const headers = await getAuthHeaders()
    const response = await axios.get(`${Base_URL}/api/admin/trainer-verifications`, { headers })
    return response
}

export const getGymVerifications = async () => {
    console.log("fetching gym verifications")
    const headers = await getAuthHeaders()
    const response = await axios.get(`${Base_URL}/api/admin/gym-verifications`, { headers })
    return response
}

// export const approveGymVerification = async (verificationId: string) => {
//     console.log("approving gym verification", { verificationId })
//     const response = await axios.put(`${Base_URL}/api/admin/gym-verifications/${verificationId}/approve`)
//     return response
// }

// export const rejectGymVerification = async (verificationId: string) => {
//     console.log("rejecting gym verification", { verificationId })
//     const response = await axios.put(`${Base_URL}/api/admin/gym-verifications/${verificationId}/reject`)
//     return response
// }

// export const approveTrainerVerification = async (verificationId: string) => {
//     console.log("approving trainer verification", { verificationId })
//     const response = await axios.put(`${Base_URL}/api/admin/trainer-verifications/${verificationId}/approve`)
//     return response
// }

// export const rejectTrainerVerification = async (verificationId: string) => {
//     console.log("rejecting trainer verification", { verificationId })
//     const response = await axios.put(`${Base_URL}/api/admin/trainer-verifications/${verificationId}/reject`)
//     return response
// }

export const handleVerificationState = async (verificationId: string, state: 'Approved' | 'Rejected', type: 'gym' | 'trainer', entityId: number) => {
    console.log(`changing verification state`, { verificationId, state, type, entityId })
    const headers = await getAuthHeaders()
    const response = await axios.put(`${Base_URL}/api/admin/handle-verifications/${verificationId}/${state}/${type}/${entityId}`, {}, { headers })
    return response
}

export const fetchAllGyms = async (page: number = 1, limit: number = 12, search: string = '') => {
    console.log("fetching all gyms", { page, limit, search })
    const headers = await getAuthHeaders()
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
    })
    const response = await axios.get(`${Base_URL}/api/gym/getallgyms?${params}`, { headers })
    return response
}

export const fetchAllTrainers = async (page: number = 1, limit: number = 12, search: string = '') => {
    console.log("fetching all trainers", { page, limit, search })
    const headers = await getAuthHeaders()
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
    })
    const response = await axios.get(`${Base_URL}/api/trainer/getalltrainers?${params}`, { headers })
    return response
}
export const GetUserInquiries = async () => {
    console.log("fetching user inquiries")
    const headers = await getAuthHeaders()
    const response = await axios.get(`${Base_URL}/api/admin/user-inquiries`, { headers })
    return response
}
export const BannedUsers = async (
  user_id: string,
  reason: string,
  target_type: string,
  inquiryId?: number
) => {
  console.log("banned user request", { user_id, reason, target_type, inquiryId })
  const headers = await getAuthHeaders()

  const response = await axios.post(`${Base_URL}/api/admin/bannedusers`, {
    user_id,
    reason,
    target_type,
    inquiryId
  }, { headers })

  return response
}

export const UpdateInquirystate = async (inquiry_id: number, status:string) => {
    console.log("banned user successfully")
    const headers = await getAuthHeaders()
    const response = await axios.patch(`${Base_URL}/api/admin/updateinquirydetails/${inquiry_id}`,{
       status
    }, { headers })
    return response
}