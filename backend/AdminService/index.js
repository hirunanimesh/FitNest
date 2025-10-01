import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import controllers
import { 
    uploadDocuments, 
    searchDocuments, 
    getDocuments, 
    removeDocument, 
    healthCheck,
    chat,
    chatHealth,
    getMemberGrowth,
    getTrainerVerifications,
    getGymVerifications,
    handleVerificationState,
    getDashboardStats,
    getuserinquiries,
    banneduser,
    updateinquirydetails
} from './controllers/admin.controller.js';
import { testConnection } from './database/supabase.js';

// Initialize Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '50mb' })); // Parse JSON bodies with increased limit for large documents
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// Health check endpoint
app.get('/health', healthCheck);

// Document management routes
app.post('/documents/upload', uploadDocuments);
app.get('/documents/search', searchDocuments);
app.get('/documents', getDocuments);
app.delete('/documents/:id', removeDocument);

// Chat routes
app.post('/chat', chat);
app.get('/chat/health', chatHealth);

app.get('/stats/member-growth', getMemberGrowth); // New endpoint for member growth stats
app.get('/dashboard/stats', getDashboardStats); // New endpoint for dashboard stats
app.get('/user-inquiries', getuserinquiries); // New endpoint for user inquiries
app.get('/trainer-verifications', getTrainerVerifications); // New endpoint for trainer verifications
app.get('/gym-verifications', getGymVerifications); // New endpoint for gym verifications
app.put('/handle-verifications/:id/:state/:type/:entityId', handleVerificationState); // New endpoint to handle verification state changes
app.post('/bannedusers', banneduser); // New endpoint to ban users
app.patch('/updateinquirydetails/:id', updateinquirydetails); // New endpoint to update inquiry details
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 3006;

app.listen(PORT, async () => {
    console.log(`Admin Service running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log('Available endpoints:');
    console.log(`  POST /documents/upload - Upload documents for RAG`);
    console.log(`  GET  /documents/search - Search similar documents`);
    console.log(`  GET  /documents - Get all documents (paginated)`);
    console.log(`  DELETE /documents/:id - Delete a document`);
    console.log(`  POST /chat - Chat with RAG-powered chatbot`);
    console.log(`  GET  /chat/health - Check chat service health`);
    await testConnection();
});

export default app;
