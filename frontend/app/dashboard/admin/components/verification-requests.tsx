"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Eye, Check, X, Calendar, User, Building2, Phone, Mail, Download, Clock, MoreVertical, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GetTrainerVerifications, getGymVerifications, handleVerificationState } from "@/api/admin/route"

interface VerificationRequest {
  id: string
  type: "gym" | "trainer"
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  businessName?: string
  submittedAt: string
  status: "pending" | "approved" | "rejected"
  documents: {
    id: string
    name: string | null
    description?: string | null
    type: string
    url: string
    size?: string
  }[]
  avatar?: string
}

// Transform gym verification data from API
const transformGymData = (gymData: any[]): VerificationRequest[] => {
  return gymData.map((gym) => ({
    id: gym.id.toString(),
    type: "gym" as const,
    applicantName: gym.applicantname,
    applicantEmail: gym.applicant_email,
    applicantPhone: gym.applicantphone,
    businessName: gym.business_name || null,
    submittedAt: gym.submittedat,
    status: gym.status.toLowerCase() as "pending" | "approved" | "rejected",
    documents: gym.documents.map((doc: any) => ({
      id: doc.id?.toString() || Math.random().toString(),
      name: doc.name || null,
      description: doc.description || null,
      type: doc.type || "application/pdf",
      url: doc.url,
      size: doc.size || null,
    })),
    avatar: gym.profile_img,
  }))
}

// Transform trainer verification data from API
const transformTrainerData = (trainerData: any[]): VerificationRequest[] => {
  return trainerData.map((trainer) => ({
    id: trainer.id.toString(),
    type: "trainer" as const,
    applicantName: trainer.applicantname,
    applicantEmail: trainer.applicant_email,
    applicantPhone: trainer.applicantphone,
    submittedAt: trainer.submittedat || new Date().toISOString(),
    status: trainer.status.toLowerCase() as "pending" | "approved" | "rejected",
    documents: trainer.documents.map((doc: any) => ({
      id: doc.id?.toString() || Math.random().toString(),
      name: doc.name || null,
      description: doc.description || null,
      type: doc.type || "application/pdf",
      url: doc.url,
      size: doc.size || null,
    })),
    avatar: trainer.profile_img,
  }))
}

export default function VerificationRequests() {
  const [gymRequests, setGymRequests] = useState<VerificationRequest[]>([])
  const [trainerRequests, setTrainerRequests] = useState<VerificationRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("gym")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")

  // Load data from APIs
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [gymResponse, trainerResponse] = await Promise.all([
          getGymVerifications(),
          GetTrainerVerifications()
        ])

        if (gymResponse.data.success) {
          setGymRequests(transformGymData(gymResponse.data.data))
        }

        if (trainerResponse.data.success) {
          setTrainerRequests(transformTrainerData(trainerResponse.data.data))
        }
      } catch (error) {
        console.error("Error loading verification data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleApprove = async (requestId: string, type: "gym" | "trainer") => {
    try {
      await handleVerificationState(requestId, "Approved")
      
      if (type === "gym") {
        setGymRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "approved" as const } : req)))
      } else {
        setTrainerRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "approved" as const } : req)))
      }
    } catch (error) {
      console.error("Error approving verification:", error)
      // You could add a toast notification here for error handling
    }
  }

  const handleReject = async (requestId: string, type: "gym" | "trainer") => {
    try {
      await handleVerificationState(requestId, "Rejected")
      
      if (type === "gym") {
        setGymRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const } : req)))
      } else {
        setTrainerRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const } : req)))
      }
    } catch (error) {
      console.error("Error rejecting verification:", error)
      // You could add a toast notification here for error handling
    }
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
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "approved":
        return "bg-green-600/20 text-green-400 border-green-600/30"
      case "rejected":
        return "bg-red-800/20 text-red-300 border-red-800/30"
      default:
        return "bg-gray-600/20 text-gray-400 border-gray-600/30"
    }
  }

  // Get current requests based on active tab and status filter
  const getCurrentRequests = () => {
    const requests = activeTab === "gym" ? gymRequests : trainerRequests
    
    if (statusFilter === "all") {
      return requests
    }
    
    return requests.filter(request => request.status === statusFilter)
  }

  // Get stats for current tab (from all requests, not filtered)
  const getStats = () => {
    const allRequests = activeTab === "gym" ? gymRequests : trainerRequests
    return {
      pending: allRequests.filter(r => r.status === "pending").length,
      approved: allRequests.filter(r => r.status === "approved").length,
      rejected: allRequests.filter(r => r.status === "rejected").length,
    }
  }

  const stats = getStats()

  if (loading) {
    return (
      <div className="space-y-4 p-4 md:p-0">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-white">Loading verification requests...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 md:p-0">
      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => {
          setActiveTab(value)
          setStatusFilter("all") // Reset filter when switching tabs
        }} 
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border-gray-700">
          <TabsTrigger value="gym" className="data-[state=active]:bg-gray-700">
            <Building2 className="w-4 h-4 mr-2" />
            Gym Verifications ({gymRequests.length})
          </TabsTrigger>
          <TabsTrigger value="trainer" className="data-[state=active]:bg-gray-700">
            <User className="w-4 h-4 mr-2" />
            Trainer Verifications ({trainerRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Status Filter */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
          <h2 className="text-lg font-semibold text-white">
            {activeTab === "gym" ? "Gym" : "Trainer"} Verification Requests
          </h2>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400" />
            <Select value={statusFilter} onValueChange={(value: "all" | "pending" | "approved" | "rejected") => setStatusFilter(value)}>
              <SelectTrigger className="w-full sm:w-40 md:w-44 lg:w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="all" className="text-white hover:bg-gray-700">All Status</SelectItem>
                <SelectItem value="pending" className="text-yellow-400 hover:bg-gray-700">Pending</SelectItem>
                <SelectItem value="approved" className="text-green-400 hover:bg-gray-700">Approved</SelectItem>
                <SelectItem value="rejected" className="text-red-400 hover:bg-gray-700">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="gym" className="space-y-6">
          {renderVerificationContent()}
        </TabsContent>

        <TabsContent value="trainer" className="space-y-6">
          {renderVerificationContent()}
        </TabsContent>
      </Tabs>
    </div>
  )

  function renderVerificationContent() {
    const currentRequests = getCurrentRequests()
    const currentStats = getStats()

    return (
      <>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pending</p>
                  <p className="text-2xl font-bold text-white">{currentStats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600/10 rounded-lg">
                  <Check className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Approved</p>
                  <p className="text-2xl font-bold text-white">{currentStats.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-800/10 rounded-lg">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Rejected</p>
                  <p className="text-2xl font-bold text-white">{currentStats.rejected}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Requests List */}
        <div className="space-y-4">
          {currentRequests.length === 0 ? (
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-8 text-center">
                <p className="text-gray-400">
                  No {activeTab} verification requests found
                  {statusFilter !== "all" && ` with ${statusFilter} status`}.
                </p>
                {statusFilter !== "all" && (
                  <p className="text-sm text-gray-500 mt-2">
                    Try changing the status filter to see more results.
                  </p>
                )}
              </CardContent>
            </Card>
          ) : (
            currentRequests.map((request) => (
              <Card key={request.id} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-colors">
                <CardContent className="p-4 md:p-6">
                  {/* Desktop Layout */}
                  <div className="hidden md:flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.applicantName} />
                        <AvatarFallback className="bg-red-600/10 text-red-400">
                          {request.applicantName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">{request.applicantName}</h3>
                          <Badge variant="outline" className="capitalize border-gray-600 text-gray-300">
                            {request.type === "gym" ? (
                              <Building2 className="w-3 h-3 mr-1" />
                            ) : (
                              <User className="w-3 h-3 mr-1" />
                            )}
                            {request.type}
                          </Badge>
                          <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                        </div>

                        {request.businessName && (
                          <p className="text-sm text-gray-300 font-medium">{request.businessName}</p>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-gray-400">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {request.applicantEmail}
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {request.applicantPhone}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {formatDate(request.submittedAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-400">
                            {request.documents.length} document{request.documents.length !== 1 ? "s" : ""} uploaded
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            className="border-gray-600 hover:bg-gray-300 text-black"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Documents
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-gray-800 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white">Documents - {request.applicantName}</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-96">
                            <div className="space-y-3">
                              {request.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-gray-400" />
                                    <div>
                                      <p className="font-medium text-white">{doc.name || "Unnamed Document"}</p>
                                      {doc.description && (
                                        <p className="text-sm text-gray-400">{doc.description}</p>
                                      )}
                                      <p className="text-xs text-gray-500">{doc.type}</p>
                                    </div>
                                  </div>
                                  <Button size="sm" variant="outline" asChild>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                      <Download className="w-4 h-4" />
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>

                      {request.status === "pending" && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApprove(request.id, request.type)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleReject(request.id, request.type)}
                            className="bg-red-800 hover:bg-red-900 text-white"
                          >
                            <X className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Mobile Layout */}
                  <div className="md:hidden space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={request.avatar || "/placeholder.svg"} alt={request.applicantName} />
                          <AvatarFallback className="bg-red-600/10 text-red-400 text-sm">
                            {request.applicantName
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white text-base truncate">{request.applicantName}</h3>
                          {request.businessName && (
                            <p className="text-sm text-gray-300 truncate">{request.businessName}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="capitalize border-gray-600 text-gray-300 text-xs">
                              {request.type === "gym" ? (
                                <Building2 className="w-3 h-3 mr-1" />
                              ) : (
                                <User className="w-3 h-3 mr-1" />
                              )}
                              {request.type}
                            </Badge>
                            <Badge className={`${getStatusColor(request.status)} text-xs`}>{request.status}</Badge>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Actions Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                          <DropdownMenuItem
                            onClick={() => setSelectedRequest(request)}
                            className="text-white hover:bg-gray-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Documents
                          </DropdownMenuItem>

                          {request.status === "pending" && (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleApprove(request.id, request.type)}
                                className="text-green-400 hover:bg-gray-700"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Accept
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleReject(request.id, request.type)}
                                className="text-red-400 hover:bg-gray-700"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Mobile Contact Info */}
                    <div className="space-y-2 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{request.applicantEmail}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{request.applicantPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{formatDate(request.submittedAt)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {request.documents.length} document{request.documents.length !== 1 ? "s" : ""} uploaded
                        </span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons for pending requests */}
                    {request.status === "pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(request.id, request.type)}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleReject(request.id, request.type)}
                          className="bg-red-800 hover:bg-red-900 text-white flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </>
    )
  }
}