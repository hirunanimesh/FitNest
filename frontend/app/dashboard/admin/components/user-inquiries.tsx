// ...existing code...
"use client"
import { useState, useEffect } from "react"
import { GetUserInquiries } from "@/api/admin/route"
import { GetGymDetails } from "@/api/user/route"
import { GetCustomerById, GetTrainerById } from "@/lib/api"
import {
  AlertTriangle,
  Ban,
  Calendar,
  Eye,
  Filter,
  MessageSquare,
  Search,
  Shield,
  UserX,
  Clock,
  CheckCircle,
} from "lucide-react"
import { BannedUsers } from "@/api/admin/route"

interface UserInquiry {
  id: string
  reporterName: string
  reporterEmail: string
  reporterAvatar?: string
  targetName: string
  targetEmail: string
  targetAvatar?: string
  targetType: "trainer" | "gym"
  inquiryType: "harassment" | "inappropriate_content" | "spam" | "fraud" | "Something Else"
  subject: string
  description: string
  submittedAt: string
  status: "pending" | "reviewed" | "resolved" | "dismissed"
  priority: "low" | "medium" | "high"
  targetBanned?: boolean
  bannedUserId?: string | null
}

export default function UserInquiries() {
  const [inquiries, setInquiries] = useState<UserInquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInquiry, setSelectedInquiry] = useState<UserInquiry | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [banDialogOpen, setBanDialogOpen] = useState(false)
  const [banReason, setBanReason] = useState("")

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        const response = await GetUserInquiries()
        const apiInquiries = response.data?.data ?? []

        const mappedInquiries: UserInquiry[] = await Promise.all(
          apiInquiries.map(async (item: any) => {
            const userInfo = await GetCustomerById(item.reporter_id)

            const reporterName = userInfo?.user?.first_name ?? ""
            const reporterEmail = userInfo?.email ?? ""

            let targetName = `${item.target_type} #${item.target_id}`
            let targetAvatar: string | undefined = undefined
            let bannedUserId: string | null = null

            if (item.target_type === "trainer") {
              const restrainer = await GetTrainerById(item.target_id)
              targetName = restrainer?.trainer?.trainer_name ?? targetName
              targetAvatar = restrainer?.trainer?.profile_img
              bannedUserId = restrainer?.trainer?.user_id ?? null
            } else if (item.target_type === "gym") {
              const res = await GetGymDetails(item.target_id)
              targetName = res?.data?.gym?.gym_name ?? targetName
              targetAvatar = res?.data?.gym?.profile_img
              bannedUserId = res?.data?.gym?.user_id ?? null
            }

            return {
              id: String(item.id),
              reporterName,
              reporterEmail,
              reporterAvatar: userInfo?.user?.profile_img,
              targetName,
              targetEmail: "",
              targetAvatar,
              targetType: (item.target_type as string).toLowerCase() as "trainer" | "gym",
              inquiryType: (item.report_type as string) || "Something Else",
              subject: item.subject ?? "",
              description: item.description ?? "",
              submittedAt: item.created_at ?? new Date().toISOString(),
              status: ((item.state as string) || "pending").toLowerCase() as UserInquiry["status"],
              priority: "medium",
              targetBanned: false,
              bannedUserId,
            }
          }),
        )
        setInquiries(mappedInquiries)
      } catch (err: any) {
        setError(err?.message || "Failed to fetch inquiries")
      } finally {
        setLoading(false)
      }
    }

    fetchInquiries()
  }, [])

  const handleBanUser = async (inquiry: UserInquiry) => {
    if (!inquiry.bannedUserId) return

    try {
      await BannedUsers(inquiry.bannedUserId, banReason)
      setInquiries((prev) =>
        prev.map((i) =>
          i.id === inquiry.id ? { ...i, targetBanned: true, status: "resolved" } : i,
        ),
      )
      setBanDialogOpen(false)
      setBanReason("")
    } catch (err) {
      console.error("Failed to ban user", err)
    }
  }

  const handleUpdateStatus = (inquiryId: string, newStatus: UserInquiry["status"]) => {
    setInquiries((prev) =>
      prev.map((inquiry) =>
        inquiry.id === inquiryId ? { ...inquiry, status: newStatus } : inquiry,
      ),
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-300/30 px-2 py-1 rounded-md text-xs border"
      case "reviewed":
        return "bg-blue-500/20 text-blue-300 border-blue-300/30 px-2 py-1 rounded-md text-xs border"
      case "resolved":
        return "bg-green-500/20 text-green-300 border-green-300/30 px-2 py-1 rounded-md text-xs border"
      case "dismissed":
        return "bg-gray-500/20 text-gray-300 border-gray-300/30 px-2 py-1 rounded-md text-xs border"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-300/30 px-2 py-1 rounded-md text-xs border"
    }
  }

  const getInquiryTypeIcon = (type: string) => {
    switch (type) {
      case "harassment":
        return <Shield className="w-4 h-4" />
      case "spam":
        return <MessageSquare className="w-4 h-4" />
      case "fraud":
        return <AlertTriangle className="w-4 h-4" />
      case "inappropriate_content":
        return <UserX className="w-4 h-4" />
      default:
        return <MessageSquare className="w-4 h-4" />
    }
  }

  // Apply filters
  const filteredInquiries = inquiries.filter((inquiry) => {
    const q = searchTerm.trim().toLowerCase()
    const matchesSearch =
      !q ||
      inquiry.reporterName.toLowerCase().includes(q) ||
      inquiry.targetName.toLowerCase().includes(q) ||
      inquiry.subject.toLowerCase().includes(q)
    const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter
    const matchesPriority = priorityFilter === "all" || inquiry.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  if (loading) {
    return <div className="p-6 text-white">Loading inquiries...</div>
  }

  if (error) {
    return <div className="p-6 text-red-400">Error: {error}</div>
  }

  return (
    <div className="space-y-6 p-6 bg-gray-900 min-h-screen">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 border-gray-700 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Pending</p>
              <p className="text-2xl font-bold text-white">
                {inquiries.filter((i) => i.status === "pending").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border-gray-700 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Eye className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Reviewed</p>
              <p className="text-2xl font-bold text-white">
                {inquiries.filter((i) => i.status === "reviewed").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border-gray-700 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-300" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Resolved</p>
              <p className="text-2xl font-bold text-white">
                {inquiries.filter((i) => i.status === "resolved").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 border-gray-700 border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Ban className="w-5 h-5 text-red-300" />
            </div>
            <div>
              <p className="text-sm text-gray-300">Users Banned</p>
              <p className="text-2xl font-bold text-white">{inquiries.filter((i) => i.targetBanned).length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border-gray-700 border rounded-lg">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-white text-lg font-semibold flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor="search" className="text-white text-sm font-medium">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="search"
                  placeholder="Search inquiries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border-gray-600 border rounded-md text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-white text-sm font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 border-gray-600 border rounded-md text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              >
                <option value="all" className="bg-gray-800 text-white">All Status</option>
                <option value="pending" className="bg-gray-800 text-white">Pending</option>
                <option value="reviewed" className="bg-gray-800 text-white">Reviewed</option>
                <option value="resolved" className="bg-gray-800 text-white">Resolved</option>
                <option value="dismissed" className="bg-gray-800 text-white">Dismissed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Inquiries List */}
      <div className="space-y-4">
        {filteredInquiries.map((inquiry) => (
          <div key={inquiry.id} className="bg-gray-800 border-gray-700 border rounded-lg hover:bg-gray-750 transition-colors">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 flex-1">
                  <div className="hidden sm:flex items-center gap-2 text-gray-300 flex-shrink-0">
                    {getInquiryTypeIcon(inquiry.inquiryType)}
                  </div>

                  <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-2 sm:hidden text-gray-300">
                        {getInquiryTypeIcon(inquiry.inquiryType)}
                        <h3 className="text-lg font-semibold text-white truncate">{inquiry.subject}</h3>
                      </div>

                      <h3 className="hidden sm:block text-lg font-semibold text-white">{inquiry.subject}</h3>

                      {inquiry.targetBanned && (
                        <span className="bg-red-500/20 text-red-300 border-red-300/30 px-2 py-1 rounded-md text-xs border flex items-center gap-1">
                          <Ban className="w-3 h-3" />
                          Banned
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={inquiry.reporterAvatar} alt={inquiry.reporterName} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">Reporter: {inquiry.reporterName}</p>
                          <p className="text-xs text-gray-300 truncate">{inquiry.reporterEmail}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-red-500/10 rounded-full flex items-center justify-center text-red-300 text-xs font-medium flex-shrink-0">
                          <img src={inquiry.targetAvatar} alt={inquiry.targetName} className="w-8 h-8 rounded-full flex-shrink-0 object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">Target: {inquiry.targetName}</p>
                          <p className="text-xs text-gray-300 truncate">
                            {inquiry.targetEmail} • {inquiry.targetType}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-300">
                      <Calendar className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{formatDate(inquiry.submittedAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-2 sm:gap-2 lg:gap-2 xl:gap-2 lg:ml-4 min-w-0 sm:min-w-fit">
                  <button
                    onClick={() => {
                      setSelectedInquiry(inquiry)
                      setDetailsDialogOpen(true)
                    }}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded text-white text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <Eye className="w-4 h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">Details</span>
                  </button>

                  <select
                    value={inquiry.status}
                    onChange={(e) => handleUpdateStatus(inquiry.id, e.target.value as UserInquiry["status"])}
                    className="px-3 py-2 bg-gray-700 border-gray-600 border rounded text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none min-w-0"
                  >
                    <option value="pending" className="bg-gray-800 text-white">Pending</option>
                    <option value="reviewed" className="bg-gray-800 text-white">Reviewed</option>
                    <option value="resolved" className="bg-gray-800 text-white">Resolved</option>
                    <option value="dismissed" className="bg-gray-800 text-white">Dismissed</option>
                  </select>

                  {!inquiry.targetBanned && (
                    <button
                      onClick={() => {
                        setSelectedInquiry(inquiry)
                        setBanDialogOpen(true)
                      }}
                      className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                    >
                      <Ban className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline">Ban User</span>
                      <span className="sm:hidden">Ban</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Details Dialog */}
      {detailsDialogOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 border-gray-700 border rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-white text-lg font-semibold">Inquiry Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-white font-medium text-sm">Subject</label>
                <p className="text-sm text-gray-300 mt-1">{selectedInquiry.subject}</p>
              </div>
              <div>
                <label className="text-white font-medium text-sm">Description</label>
                <p className="text-sm text-gray-300 mt-1">{selectedInquiry.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-medium text-sm">Type</label>
                  <p className="text-sm text-gray-300 mt-1 capitalize">
                    {selectedInquiry.inquiryType.replace("_", " ")}
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end">
              <button
                onClick={() => setDetailsDialogOpen(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ban Dialog */}
      {banDialogOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-gray-900 text-lg font-semibold">Ban User</h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-700">
                Are you sure you want to ban <strong>{selectedInquiry.targetName}</strong>? This action
                will restrict their access to the platform.
              </p>
              <div className="space-y-2">
                <label htmlFor="ban-reason" className="text-gray-900 text-sm font-medium">
                  Reason for ban
                </label>
                <textarea
                  id="ban-reason"
                  placeholder="Enter the reason for banning this user..."
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  rows={3}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setBanDialogOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedInquiry && handleBanUser(selectedInquiry)}
                disabled={!banReason.trim()}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded transition-colors"
              >
                Ban User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}