import { 
    uploadDocumentsToRAG, 
    searchSimilarDocuments, 
    getAllDocuments, 
    deleteDocument 
} from '../services/document.service.js';
import { 
    processChatQuestion, 
    getChatHealthStatus 
} from '../services/chat.service.js';
import Joi from 'joi';
import AdminService from '../services/admin.service.js';

// Validation schemas
const uploadDocumentsSchema = Joi.object({
    documents: Joi.array()
        .items(Joi.string().min(1).max(50000)) // Max 50k chars per document
        .min(1)
        .max(100) // Max 100 documents per batch
        .required(),
    metadata: Joi.array()
        .items(Joi.object().optional())
        .optional()
});

const searchDocumentsSchema = Joi.object({
    query: Joi.string().min(1).max(1000).required(),
    limit: Joi.number().integer().min(1).max(50).default(5)
});

const paginationSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
});

const chatSchema = Joi.object({
    question: Joi.string().min(1).max(1000).required()
});

/**
 * Upload documents with embeddings for RAG
 */
export async function uploadDocuments(req, res) {
    console.log('Upload documents request received');
    try {
        // Validate request body
        const { error, value } = uploadDocumentsSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data',
                details: error.details
            });
        }

        const { documents, metadata } = value;

        console.log(`Received request to upload ${documents.length} documents`);

        // Upload documents
        const result = await uploadDocumentsToRAG(documents, metadata);

        // Return success response
        res.status(201).json({
            success: true,
            message: result.message,
            data: {
                insertedCount: result.insertedCount,
                totalDocuments: result.totalDocuments,
                insertedIds: result.insertedIds,
                errors: result.errors
            }
        });

    } catch (error) {
        console.error('Error in uploadDocuments controller:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

/**
 * Search for similar documents
 */
export async function searchDocuments(req, res) {
    try {
        // Validate query parameters
        const { error, value } = searchDocumentsSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                details: error.details
            });
        }

        const { query, limit } = value;

        console.log(`Searching for similar documents with query: "${query}"`);

        // Search documents
        const result = await searchSimilarDocuments(query, limit);

        res.status(200).json({
            success: true,
            message: `Found ${result.count} similar documents`,
            data: {
                query: query,
                results: result.results,
                count: result.count
            }
        });

    } catch (error) {
        console.error('Error in searchDocuments controller:', error);
        res.status(500).json({
            success: false,
            message: 'Search failed',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

/**
 * Get all documents with pagination
 */
export async function getDocuments(req, res) {
    try {
        console.log('Get documents request received');
        // Validate query parameters
        const { error, value } = paginationSchema.validate(req.query);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                details: error.details
            });
        }

        const { page, limit } = value;
        
        console.log(`Fetching documents - Page: ${page}, Limit: ${limit}`);

        // Get documents
        const result = await getAllDocuments(page, limit);

        res.status(200).json({
            success: true,
            message: `Retrieved ${result.documents.length} documents`,
            data: {
                documents: result.documents,
                pagination: result.pagination
            }
        });

    } catch (error) {
        console.error('Error in getDocuments controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch documents',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

/**
 * Delete a document by ID
 */
export async function removeDocument(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Document ID is required'
            });
        }

        console.log(`Deleting document with ID: ${id}`);

        // Delete document
        const result = await deleteDocument(id);

        res.status(200).json({
            success: true,
            message: result.message
        });

    } catch (error) {
        console.error('Error in removeDocument controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete document',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

/**
 * Health check endpoint
 */
export async function healthCheck(req, res) {
    res.status(200).json({
        success: true,
        message: 'Admin Service is running',
        timestamp: new Date().toISOString(),
        service: 'AdminService'
    });
}

/**
 * Process chat question using RAG
 */
export async function chat(req, res) {
    console.log('Chat request received');
    try {
        // Validate request body
        const { error, value } = chatSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Invalid request data',
                details: error.details
            });
        }

        const { question } = value;

        console.log(`Processing chat question: ${question}`);

        // Process the chat question using RAG
        const result = await processChatQuestion(question);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error,
                answer: result.answer
            });
        }

        res.status(200).json({
            success: true,
            answer: result.answer,
            sources: result.sources,
            similarity_scores: result.similarity_scores
        });

    } catch (error) {
        console.error('Error in chat controller:', error);
        res.status(500).json({
            success: false,
            error: 'Chat processing failed',
            answer: 'I apologize, but I encountered an error while processing your question. Please try again later.'
        });
    }
}

/**
 * Get chat service health status
 */
export async function chatHealth(req, res) {
    try {
        const healthStatus = await getChatHealthStatus();
        
        const statusCode = healthStatus.ready ? 200 : 503;
        
        res.status(statusCode).json({
            success: healthStatus.success,
            ...healthStatus
        });

    } catch (error) {
        console.error('Error in chatHealth controller:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            ready: false
        });
    }
}

//get member growth stats
export async function getMemberGrowth(req, res) {
    console.log('in the admin controller');
    try {
        const result = await AdminService.getMemberGrowthStats();
        res.status(200).json({
            success: true,
            message: 'Member growth stats retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in getMemberGrowth controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve member growth stats',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

export async function getTrainerVerifications(req, res) {
    console.log('in the getTrainerVerifications controller');
    try {
        const result = await AdminService.getTrainerVerifications();
        console.log("result in controller",result)
        res.status(200).json({
            success: true,
            message: 'Trainer verifications retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in getTrainerVerifications controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve trainer verifications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

export async function getGymVerifications(req, res) {
    console.log('in the getGymVerifications controller');
    try {
        const result = await AdminService.getGymVerifications();
        console.log("result in controller",result)
        res.status(200).json({
            success: true,
            message: 'Gym verifications retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in getGymVerifications controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve gym verifications',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

export async function handleVerificationState(req, res) {
    console.log('in the handleVerificationState controller');
    const { id, state, type, entityId } = req.params;

    try {
        const result = await AdminService.handleVerificationState(id, state, type, entityId);
        res.status(200).json({
            success: true,
            message: 'Verification state updated successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in handleVerificationState controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update verification state',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}

export async function getDashboardStats(req,res){
    console.log('in the getDashboardStats controller');
    try {
        const result = await AdminService.getDashboardStats();
        res.status(200).json({
            success: true,
            message: 'Dashboard stats retrieved successfully',
            data: result
        });
    } catch (error) {
        console.error('Error in getDashboardStats controller:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard stats',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
        });
    }
}