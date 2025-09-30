import axios from "axios"

//const ADMIN_SERVICE_URL = process.env.NEXT_PUBLIC_ADMIN_SERVICE_URL || 'http://localhost:3006';
const Base_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export const UploadDocuments = async (documents: string[], metadata: any[]) => {
    console.log("in the upload documents API", { documents, metadata })
    const response = await axios.post(`${Base_URL}/api/admin/documents/upload`, { 
        documents, 
        metadata 
    })
    return response
}

export const FetchDocuments = async (page: number = 1, limit: number = 10) => {
    console.log("in the fetch documents API", { page, limit })
    const response = await axios.get(`${Base_URL}/api/admin/documents`, {
        params: { page, limit }
    })
    return response
}

export const SearchDocuments = async (query: string, limit: number = 10) => {
    console.log("in the search documents API", { query, limit })
    const response = await axios.get(`${Base_URL}/api/admin/documents/search`, {
        params: { query, limit }
    })
    return response
}

export const DeleteDocument = async (documentId: string) => {
    console.log("in the delete document API", { documentId })
    const response = await axios.delete(`${Base_URL}/api/admin/documents/${documentId}`)
    return response
}

export const ChatWithAI = async (question: string) => {
    console.log("in the chat API", { question })
    const response = await axios.post(`${Base_URL}/api/admin/chat`, {
        question
    })
    return response
}

export const GetChatHealth = async () => {
    console.log("checking chat health")
    const response = await axios.get(`${Base_URL}/api/admin/chat/health`)
    return response
}

export const MemberGrowth = async (startDate?: string, endDate?: string) => {
    console.log("fetching member growth data", { startDate, endDate })
    const params: any = {}
    if (startDate) params.startDate = startDate
    if (endDate) params.endDate = endDate
    
    const response = await axios.get(`${Base_URL}/api/admin/stats/member-growth`, {
        params
    })
    return response
}

export const GetDashboardStats = async () => {
    console.log("fetching dashboard stats")
    const response = await axios.get(`${Base_URL}/api/admin/dashboard/stats`)
    return response
}

export const GetTrainerVerifications = async () => {
    console.log("fetching trainer verifications")
    const response = await axios.get(`${Base_URL}/api/admin/trainer-verifications`)
    return response
}

export const getGymVerifications = async () => {
    console.log("fetching gym verifications")
    const response = await axios.get(`${Base_URL}/api/admin/gym-verifications`)
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
    const response = await axios.put(`${Base_URL}/api/admin/handle-verifications/${verificationId}/${state}/${type}/${entityId}`)
    return response
}

export const fetchAllGyms = async (page: number = 1, limit: number = 12, search: string = '') => {
    console.log("fetching all gyms", { page, limit, search })
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
    })
    const response = await axios.get(`${Base_URL}/api/gym/getallgyms?${params}`)
    return response
}

export const fetchAllTrainers = async (page: number = 1, limit: number = 12, search: string = '') => {
    console.log("fetching all trainers", { page, limit, search })
    const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search })
    })
    const response = await axios.get(`${Base_URL}/api/trainer/getalltrainers?${params}`)
    return response
}
export const GetUserInquiries = async () => {
    console.log("fetching user inquiries")
    const response = await axios.get(`${Base_URL}/api/admin/user-inquiries`)
    return response
}
export const BannedUsers = async (user_id: string, reason: string, inquiry_id?: number) => {
    console.log("banned user request", { user_id, reason, inquiry_id })
    const response = await axios.post(`${Base_URL}/api/admin/bannedusers`, {
        user_id,
        reason
    })

    // If an inquiry id is provided, mark that inquiry as resolved
    if (inquiry_id) {
        try {
            await UpdateInquirystate(inquiry_id, 'resolved')
        } catch (err) {
            // Log but don't fail the ban request if inquiry update fails
            console.error('Failed to update inquiry state to resolved:', err)
        }
    }

    return response
}
export const UpdateInquirystate = async (inquiry_id: number, state:string) => {
    console.log("banned user successfully")
    const response = await axios.patch(`${Base_URL}/api/admin/updateinquirydetails/${inquiry_id}`,{
       state
    })
    return response
}