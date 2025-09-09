"use client"

import { useState, useEffect } from "react"
import { UploadDocuments, FetchDocuments, SearchDocuments, DeleteDocument } from "@/api/admin/route"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Upload, 
  Search, 
  FileText, 
  Trash2, 
  Plus, 
  Loader2,
  AlertCircle,
  CheckCircle2,
  Eye,
  Calendar
} from "lucide-react"

interface Document {
  id: string
  content: string
  metadata: any
  
}

interface DocumentFormData {
  content: string
  title: string
  category: string
  description: string
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Form state for multiple documents
  const [documentsToUpload, setDocumentsToUpload] = useState<DocumentFormData[]>([
    { content: '', title: '', category: '', description: '' }
  ])

  // Fetch documents on component mount
  useEffect(() => {
    fetchDocuments()
  }, [currentPage])

  // Clear alert after 5 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [alert])

  const fetchDocuments = async () => {
    setLoading(true)
    try {
      const response = await FetchDocuments(currentPage, 10)
      
      if (response.status >= 200 && response.status < 300 && response.data.success) {
        setDocuments(response.data.data.documents)
        setTotalPages(response.data.data.pagination.totalPages)
      } else {
        throw new Error(response.data.message || 'Failed to fetch documents')
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error)
      setAlert({ type: 'error', message: `Error fetching documents: ${error.response?.data?.message || error.message}` })
    } finally {
      setLoading(false)
    }
  }

  const handleUploadDocuments = async () => {
    console.log('in the function')
    // Filter out empty documents
    const validDocuments = documentsToUpload.filter(doc => doc.content.trim().length > 0)
    
    if (validDocuments.length === 0) {
      setAlert({ type: 'error', message: 'Please provide at least one document with content.' })
      return
    }

    setUploading(true)
    try {
      const documents = validDocuments.map(doc => doc.content)
      const metadata = validDocuments.map(doc => ({
        title: doc.title || 'Untitled',
        category: doc.category || 'general',
        description: doc.description || ''
      }))

      const response = await UploadDocuments(documents, metadata)

      if (response.status >= 200 && response.status < 300 && response.data.success) {
        setAlert({ 
          type: 'success', 
          message: `Successfully uploaded ${response.data.data.insertedCount} out of ${validDocuments.length} documents!` 
        })
        setIsUploadDialogOpen(false)
        setDocumentsToUpload([{ content: '', title: '', category: '', description: '' }])
        fetchDocuments() // Refresh the documents list
      } else {
        throw new Error(response.data.message || 'Failed to upload documents')
      }
    } catch (error: any) {
      console.error('Error uploading documents:', error)
      setAlert({ type: 'error', message: `Upload failed: ${error.response?.data?.message || error.message}` })
    } finally {
      setUploading(false)
    }
  }

  const handleSearchDocuments = async () => {
    if (!searchQuery.trim()) {
      setAlert({ type: 'error', message: 'Please enter a search query.' })
      return
    }

    setSearching(true)
    try {
      const response = await SearchDocuments(searchQuery, 10)

      if (response.status >= 200 && response.status < 300 && response.data.success) {
        setSearchResults(response.data.data.results)
        setAlert({ 
          type: 'success', 
          message: `Found ${response.data.data.count} similar documents.` 
        })
      } else {
        throw new Error(response.data.message || 'Search failed')
      }
    } catch (error: any) {
      console.error('Error searching documents:', error)
      setAlert({ type: 'error', message: `Search failed: ${error.response?.data?.message || error.message}` })
    } finally {
      setSearching(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      return
    }

    try {
      const response = await DeleteDocument(documentId)

      if (response.status >= 200 && response.status < 300 && response.data.success) {
        setAlert({ type: 'success', message: 'Document deleted successfully!' })
        fetchDocuments() // Refresh the list
      } else {
        throw new Error(response.data.message || 'Failed to delete document')
      }
    } catch (error: any) {
      console.error('Error deleting document:', error)
      setAlert({ type: 'error', message: `Delete failed: ${error.response?.data?.message || error.message}` })
    }
  }

  const addDocumentForm = () => {
    setDocumentsToUpload([...documentsToUpload, { content: '', title: '', category: '', description: '' }])
  }

  const removeDocumentForm = (index: number) => {
    if (documentsToUpload.length > 1) {
      setDocumentsToUpload(documentsToUpload.filter((_, i) => i !== index))
    }
  }

  const updateDocumentForm = (index: number, field: keyof DocumentFormData, value: string) => {
    const updated = [...documentsToUpload]
    updated[index][field] = value
    setDocumentsToUpload(updated)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    return content.length > maxLength ? content.substring(0, maxLength) + '...' : content
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Document Management</h1>
          <p className="text-gray-400 mt-1">
            Manage documents for the RAG (Retrieval Augmented Generation) system
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700 text-white">
              <Upload className="w-4 h-4 mr-2" />
              Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Upload Documents</DialogTitle>
              <DialogDescription className="text-gray-400">
                Upload documents with their content and metadata. Each document will be processed for embeddings.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {documentsToUpload.map((doc, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">Document {index + 1}</CardTitle>
                      {documentsToUpload.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDocumentForm(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`title-${index}`} className="text-white">Title</Label>
                        <Input
                          id={`title-${index}`}
                          value={doc.title}
                          onChange={(e) => updateDocumentForm(index, 'title', e.target.value)}
                          placeholder="Document title"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`category-${index}`} className="text-white">Category</Label>
                        <Input
                          id={`category-${index}`}
                          value={doc.category}
                          onChange={(e) => updateDocumentForm(index, 'category', e.target.value)}
                          placeholder="e.g., fitness, nutrition, general"
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor={`description-${index}`} className="text-white">Description</Label>
                      <Input
                        id={`description-${index}`}
                        value={doc.description}
                        onChange={(e) => updateDocumentForm(index, 'description', e.target.value)}
                        placeholder="Brief description of the document"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`content-${index}`} className="text-white">Content *</Label>
                      <Textarea
                        id={`content-${index}`}
                        value={doc.content}
                        onChange={(e) => updateDocumentForm(index, 'content', e.target.value)}
                        placeholder="Paste or type the document content here..."
                        className="min-h-[150px] bg-gray-700 border-gray-600 text-white"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDocumentForm}
                  className="border-gray-600 text-white hover:bg-gray-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Document
                </Button>
                
                <div className="space-x-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsUploadDialogOpen(false)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUploadDocuments}
                    disabled={uploading}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Documents
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert */}
      {alert && (
        <Alert className={alert.type === 'success' ? 'border-green-500 bg-green-500/10' : 'border-red-500 bg-red-500/10'}>
          {alert.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className={alert.type === 'success' ? 'text-green-200' : 'text-red-200'}>
            {alert.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Search Section */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Documents
          </CardTitle>
          <CardDescription className="text-gray-400">
            Search for similar documents using semantic similarity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter search query..."
              className="bg-gray-700 border-gray-600 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSearchDocuments()}
            />
            <Button
              onClick={handleSearchDocuments}
              disabled={searching}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4">
              <h4 className="text-white font-medium mb-2">Search Results:</h4>
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <Card key={index} className="bg-gray-700 border-gray-600">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-white text-sm">
                            {truncateContent(result.content, 200)}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="bg-red-600 text-white">
                              {Math.round(result.similarity * 100)}% match
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {result.metadata?.title || 'Untitled'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(result)
                            setIsViewDialogOpen(true)
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                All Documents
              </CardTitle>
              <CardDescription className="text-gray-400">
                View and manage all uploaded documents
              </CardDescription>
            </div>
            <Badge variant="secondary" className="bg-red-600 text-white">
              {documents.length} documents
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-red-500" />
              <span className="ml-2 text-gray-400">Loading documents...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No documents found. Upload some documents to get started.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Title</TableHead>
                      <TableHead className="text-gray-300">Category</TableHead>
                      <TableHead className="text-gray-300">Content Preview</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id} className="border-gray-700">
                        <TableCell className="text-white font-medium">
                          {doc.metadata?.title || 'Untitled'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            {doc.metadata?.category || 'general'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs">
                          {truncateContent(doc.content)}
                        </TableCell>
                        {/* <TableCell className="text-gray-400 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(doc.created_at)}
                          </div>
                        </TableCell> */}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(doc)
                                setIsViewDialogOpen(true)
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-gray-400">
                    Page {currentPage} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Document Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selectedDocument?.metadata?.title || 'Document Details'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Full document content and metadata
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white">Category</Label>
                  <Badge variant="outline" className="border-gray-600 text-gray-300 mt-1">
                    {selectedDocument.metadata?.category || 'general'}
                  </Badge>
                </div>
                {/* <div>
                  <Label className="text-white">Created</Label>
                  <p className="text-gray-300 text-sm mt-1">{formatDate(selectedDocument.created_at)}</p>
                </div> */}
              </div>
              
              {selectedDocument.metadata?.description && (
                <div>
                  <Label className="text-white">Description</Label>
                  <p className="text-gray-300 text-sm mt-1">{selectedDocument.metadata.description}</p>
                </div>
              )}
              
              <Separator className="bg-gray-700" />
              
              <div>
                <Label className="text-white">Full Content</Label>
                <div className="mt-2 p-4 bg-gray-800 border border-gray-700 rounded-md max-h-96 overflow-y-auto">
                  <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                    {selectedDocument.content}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
