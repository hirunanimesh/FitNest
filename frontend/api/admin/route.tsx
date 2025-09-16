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
