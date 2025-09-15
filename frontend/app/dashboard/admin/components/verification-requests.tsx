"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Eye, Check, X, Calendar, User, Building2, Phone, Mail, Download, Clock, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
    name: string
    type: string
    url: string
    size: string
  }[]
  avatar?: string
}

const mockRequests: VerificationRequest[] = [
  {
    id: "1",
    type: "gym",
    applicantName: "Sarah Johnson",
    applicantEmail: "sarah@fitnesshub.com",
    applicantPhone: "+1 (555) 123-4567",
    businessName: "FitnessHub Downtown",
    submittedAt: "2024-01-15T10:30:00Z",
    status: "pending",
    documents: [
      { id: "1", name: "Business License.pdf", type: "application/pdf", url: "#", size: "2.4 MB" },
      { id: "2", name: "Insurance Certificate.pdf", type: "application/pdf", url: "#", size: "1.8 MB" },
      { id: "3", name: "Facility Photos.zip", type: "application/zip", url: "#", size: "15.2 MB" },
    ],
  },
  {
    id: "2",
    type: "trainer",
    applicantName: "Mike Rodriguez",
    applicantEmail: "mike.rodriguez@email.com",
    applicantPhone: "+1 (555) 987-6543",
    submittedAt: "2024-01-14T14:20:00Z",
    status: "pending",
    documents: [
      { id: "4", name: "Certification.pdf", type: "application/pdf", url: "#", size: "3.1 MB" },
      { id: "5", name: "ID Copy.jpg", type: "image/jpeg", url: "#", size: "1.2 MB" },
      { id: "6", name: "Resume.pdf", type: "application/pdf", url: "#", size: "890 KB" },
    ],
  },
  {
    id: "3",
    type: "gym",
    applicantName: "Lisa Chen",
    applicantEmail: "lisa@zenfit.com",
    applicantPhone: "+1 (555) 456-7890",
    businessName: "ZenFit Studio",
    submittedAt: "2024-01-13T09:15:00Z",
    status: "pending",
    documents: [
      { id: "7", name: "Business Registration.pdf", type: "application/pdf", url: "#", size: "1.9 MB" },
      { id: "8", name: "Health Permit.pdf", type: "application/pdf", url: "#", size: "2.2 MB" },
    ],
  },
]

export default function VerificationRequests() {
  const [requests, setRequests] = useState<VerificationRequest[]>(mockRequests)
  const [selectedRequest, setSelectedRequest] = useState<VerificationRequest | null>(null)

  const handleApprove = (requestId: string) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "approved" as const } : req)))
  }

  const handleReject = (requestId: string) => {
    setRequests((prev) => prev.map((req) => (req.id === requestId ? { ...req, status: "rejected" as const } : req)))
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

  return (
    <div className="space-y-4 p-4 md:p-0">
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
                <p className="text-2xl font-bold text-white">{requests.filter((r) => r.status === "pending").length}</p>
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
                <p className="text-2xl font-bold text-white">
                  {requests.filter((r) => r.status === "approved").length}
                </p>
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
                <p className="text-2xl font-bold text-white">
                  {requests.filter((r) => r.status === "rejected").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
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
                          <>
                            <Building2 className="w-3 h-3 mr-1" /> Gym
                          </>
                        ) : (
                          <>
                            <User className="w-3 h-3 mr-1" /> Trainer
                          </>
                        )}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
                    </div>

                    {request.businessName && (
                      <p className="text-sm text-gray-300 font-medium">{request.businessName}</p>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{request.applicantEmail}</span>
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
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
                            >
                              <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                  <p className="font-medium text-white">{doc.name}</p>
                                  <p className="text-sm text-gray-400">{doc.size}</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="hover:bg-gray-700 text-gray-300">
                                <Download className="w-4 h-4" />
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
                        onClick={() => handleApprove(request.id)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleReject(request.id)}
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
                            <>
                              <Building2 className="w-2.5 h-2.5 mr-1" /> Gym
                            </>
                          ) : (
                            <>
                              <User className="w-2.5 h-2.5 mr-1" /> Trainer
                            </>
                          )}
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
                      <Dialog>
                        <DialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            onClick={() => setSelectedRequest(request)}
                            className="text-gray-300 focus:bg-gray-700 focus:text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Documents
                          </DropdownMenuItem>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-2xl bg-gray-800 border-gray-700">
                          <DialogHeader>
                            <DialogTitle className="text-white text-base">Documents - {request.applicantName}</DialogTitle>
                          </DialogHeader>
                          <ScrollArea className="max-h-80 sm:max-h-96">
                            <div className="space-y-3">
                              {request.documents.map((doc) => (
                                <div
                                  key={doc.id}
                                  className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700"
                                >
                                  <div className="flex items-center gap-3 min-w-0 flex-1">
                                    <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="min-w-0">
                                      <p className="font-medium text-white text-sm truncate">{doc.name}</p>
                                      <p className="text-xs text-gray-400">{doc.size}</p>
                                    </div>
                                  </div>
                                  <Button variant="ghost" size="sm" className="hover:bg-gray-700 text-gray-300 flex-shrink-0">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </DialogContent>
                      </Dialog>

                      {request.status === "pending" && (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleApprove(request.id)}
                            className="text-green-400 focus:bg-green-600/10 focus:text-green-300"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleReject(request.id)}
                            className="text-red-400 focus:bg-red-600/10 focus:text-red-300"
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
                      onClick={() => handleApprove(request.id)}
                      className="bg-green-600 hover:bg-green-700 text-white flex-1"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Accept
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleReject(request.id)}
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
        ))}
      </div>
    </div>
  )
}