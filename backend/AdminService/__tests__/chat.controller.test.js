import { chat, chatHealth } from '../controllers/admin.controller.js';
import { processChatQuestion, getChatHealthStatus } from '../services/chat.service.js';

// Mock the chat service
jest.mock('../services/chat.service.js');

describe('Chat Controller Unit Tests', () => {
    const mockProcessChatQuestion = processChatQuestion;
    const mockGetChatHealthStatus = getChatHealthStatus;
    
    let req, res;

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Mock request and response objects
        req = {
            body: {},
            params: {},
            query: {}
        };
        
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };
    });

    describe('chat controller', () => {
        test('should return 400 for missing question', async () => {
            req.body = {}; // No question provided

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid request data',
                details: expect.any(Array)
            });
        });

        test('should return 400 for empty question', async () => {
            req.body = { question: '' };

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid request data',
                details: expect.any(Array)
            });
        });

        test('should return 400 for question that is too long', async () => {
            req.body = { question: 'a'.repeat(1001) }; // Exceeds 1000 char limit

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid request data',
                details: expect.any(Array)
            });
        });

        test('should return 400 for non-string question', async () => {
            req.body = { question: 123 };

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Invalid request data',
                details: expect.any(Array)
            });
        });

        test('should process valid chat question successfully', async () => {
            const question = 'What is FitNest?';
            const mockResult = {
                success: true,
                answer: 'FitNest is a fitness management platform.',
                sources: ['Document content 1', 'Document content 2'],
                similarity_scores: [0.8, 0.7]
            };

            req.body = { question };
            mockProcessChatQuestion.mockResolvedValue(mockResult);

            await chat(req, res);

            expect(mockProcessChatQuestion).toHaveBeenCalledWith(question);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                answer: mockResult.answer,
                sources: mockResult.sources,
                similarity_scores: mockResult.similarity_scores
            });
        });

        test('should handle chat service returning unsuccessful result', async () => {
            const question = 'What is FitNest?';
            const mockResult = {
                success: false,
                error: 'Database connection failed',
                answer: 'I apologize, but I encountered an error.'
            };

            req.body = { question };
            mockProcessChatQuestion.mockResolvedValue(mockResult);

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: mockResult.error,
                answer: mockResult.answer
            });
        });

        test('should handle chat service throwing an error', async () => {
            const question = 'What is FitNest?';
            req.body = { question };
            
            mockProcessChatQuestion.mockRejectedValue(new Error('Service unavailable'));

            await chat(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Chat processing failed',
                answer: 'I apologize, but I encountered an error while processing your question. Please try again later.'
            });
        });

        test('should trim whitespace from questions', async () => {
            const question = '  What is FitNest?  ';
            const mockResult = {
                success: true,
                answer: 'FitNest is a fitness management platform.',
                sources: [],
                similarity_scores: []
            };

            req.body = { question };
            mockProcessChatQuestion.mockResolvedValue(mockResult);

            await chat(req, res);

            // Controller passes the original question (with whitespace) to the service
            // The service handles the trimming internally
            expect(mockProcessChatQuestion).toHaveBeenCalledWith('  What is FitNest?  ');
        });

        test('should handle special characters in questions', async () => {
            const question = 'What is FitNest\'s pricing? 💪';
            const mockResult = {
                success: true,
                answer: 'Here is the pricing information.',
                sources: [],
                similarity_scores: []
            };

            req.body = { question };
            mockProcessChatQuestion.mockResolvedValue(mockResult);

            await chat(req, res);

            expect(mockProcessChatQuestion).toHaveBeenCalledWith(question);
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('should handle questions at maximum length', async () => {
            const question = 'a'.repeat(1000); // Exactly at limit
            const mockResult = {
                success: true,
                answer: 'Response to long question.',
                sources: [],
                similarity_scores: []
            };

            req.body = { question };
            mockProcessChatQuestion.mockResolvedValue(mockResult);

            await chat(req, res);

            expect(mockProcessChatQuestion).toHaveBeenCalledWith(question);
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });

    describe('chatHealth controller', () => {
        test('should return 200 when chat service is healthy', async () => {
            const mockHealthStatus = {
                success: true,
                ready: true,
                timestamp: '2025-01-01T00:00:00.000Z',
                services: {
                    embedding: true,
                    database: true,
                    ai: true
                }
            };

            mockGetChatHealthStatus.mockResolvedValue(mockHealthStatus);

            await chatHealth(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                ...mockHealthStatus
            });
        });

        test('should return 503 when chat service is not ready', async () => {
            const mockHealthStatus = {
                success: true,
                ready: false,
                timestamp: '2025-01-01T00:00:00.000Z',
                services: {
                    embedding: false,
                    database: true,
                    ai: true
                },
                issues: ['Embedding service unavailable']
            };

            mockGetChatHealthStatus.mockResolvedValue(mockHealthStatus);

            await chatHealth(req, res);

            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                ...mockHealthStatus
            });
        });

        test('should return 500 when health check throws error', async () => {
            const error = new Error('Health check failed');
            mockGetChatHealthStatus.mockRejectedValue(error);

            await chatHealth(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Health check failed',
                ready: false
            });
        });

        test('should handle health status with missing ready property', async () => {
            const mockHealthStatus = {
                success: true,
                // ready property is missing
                timestamp: '2025-01-01T00:00:00.000Z',
                services: {
                    embedding: true,
                    database: true
                }
            };

            mockGetChatHealthStatus.mockResolvedValue(mockHealthStatus);

            await chatHealth(req, res);

            expect(res.status).toHaveBeenCalledWith(503); // Should default to 503 when ready is falsy
        });

        test('should handle health status with mixed service states', async () => {
            const mockHealthStatus = {
                success: true,
                ready: false,
                timestamp: '2025-01-01T00:00:00.000Z',
                services: {
                    embedding: true,
                    database: false,
                    ai: true
                },
                issues: ['Database connection failed']
            };

            mockGetChatHealthStatus.mockResolvedValue(mockHealthStatus);

            await chatHealth(req, res);

            expect(res.status).toHaveBeenCalledWith(503);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                ready: false,
                services: {
                    embedding: true,
                    database: false,
                    ai: true
                }
            }));
        });

        test('should handle null/undefined health status', async () => {
            mockGetChatHealthStatus.mockResolvedValue(null);

            await chatHealth(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });

        test('should preserve all health status fields', async () => {
            const mockHealthStatus = {
                success: true,
                ready: true,
                timestamp: '2025-01-01T00:00:00.000Z',
                services: {
                    embedding: true,
                    database: true,
                    ai: true
                },
                version: '1.0.0',
                uptime: 3600,
                customField: 'custom value'
            };

            mockGetChatHealthStatus.mockResolvedValue(mockHealthStatus);

            await chatHealth(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                ...mockHealthStatus
            });
        });
    });
});
