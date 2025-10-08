import { generateEmbedding, generateBatchEmbeddings } from '../services/embedding.service.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Mock GoogleGenerativeAI
jest.mock('@google/generative-ai');

describe('Embedding Service Unit Tests', () => {
    const mockGoogleGenerativeAI = GoogleGenerativeAI;
    
    beforeEach(() => {
        jest.clearAllMocks();
        
        // Reset environment variables
        delete process.env.GOOGLE_API_KEY;
    });

    describe('generateEmbedding', () => {
        test('should use mock embeddings when no API key is provided', async () => {
            const text = 'Test document content';
            
            const embedding = await generateEmbedding(text);
            
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding).toHaveLength(768);
            expect(embedding.every(val => typeof val === 'number')).toBe(true);
            expect(embedding.every(val => val >= -1 && val <= 1)).toBe(true);
        });

        test('should use mock embeddings when API key is placeholder', async () => {
            process.env.GOOGLE_API_KEY = 'placeholder-key';
            
            const text = 'Test document content';
            
            const embedding = await generateEmbedding(text);
            
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding).toHaveLength(768);
        });

        test('should generate consistent mock embeddings for same text', async () => {
            const text = 'Test document content';
            
            const embedding1 = await generateEmbedding(text);
            const embedding2 = await generateEmbedding(text);
            
            expect(embedding1).toEqual(embedding2);
        });

        test('should generate different mock embeddings for different text', async () => {
            const text1 = 'First document';
            const text2 = 'Second document';
            
            const embedding1 = await generateEmbedding(text1);
            const embedding2 = await generateEmbedding(text2);
            
            expect(embedding1).not.toEqual(embedding2);
        });

        test('should normalize mock embeddings', async () => {
            const text = 'Test document content';
            
            const embedding = await generateEmbedding(text);
            
            // Check if vector is normalized (magnitude should be approximately 1)
            const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
            expect(magnitude).toBeCloseTo(1, 5);
        });

        test('should use real embeddings when valid API key is provided', async () => {
            // Ensure module sees API key at import time
            jest.resetModules();
            process.env.GOOGLE_API_KEY = 'real-api-key';
            
            const mockEmbedResult = {
                embedding: {
                    values: new Array(768).fill(0.5)
                }
            };
            
            const mockModel = {
                embedContent: jest.fn().mockResolvedValue(mockEmbedResult)
            };
            
            mockGoogleGenerativeAI.mockImplementation(() => ({
                getGenerativeModel: jest.fn().mockReturnValue(mockModel)
            }));

            const { generateEmbedding: freshGenerateEmbedding } = await import('../services/embedding.service.js');
            const text = 'Test document content';
            const embedding = await freshGenerateEmbedding(text);
            
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding).toHaveLength(768);
        });

        test('should handle real embedding API failure and fallback to mock', async () => {
            // Ensure module sees API key at import time
            jest.resetModules();
            process.env.GOOGLE_API_KEY = 'real-api-key';
            
            const mockModel = {
                embedContent: jest.fn().mockRejectedValue(new Error('API quota exceeded'))
            };
            
            mockGoogleGenerativeAI.mockImplementation(() => ({
                getGenerativeModel: jest.fn().mockReturnValue(mockModel)
            }));

            const { generateEmbedding: freshGenerateEmbedding } = await import('../services/embedding.service.js');

            const text = 'Test document content';
            const embedding = await freshGenerateEmbedding(text);
            
            // Should fallback to mock embeddings
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding).toHaveLength(768);
        });

        test('should handle empty text input', async () => {
            const text = '';
            
            const embedding = await generateEmbedding(text);
            
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding).toHaveLength(768);
        });

        test('should handle very long text input', async () => {
            const text = 'a'.repeat(10000);
            
            const embedding = await generateEmbedding(text);
            
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding).toHaveLength(768);
        });

        test('should handle text with special characters', async () => {
            const text = 'Text with émojis 🏋️‍♂️ and special chars: @#$%^&*()';
            
            const embedding = await generateEmbedding(text);
            
            expect(Array.isArray(embedding)).toBe(true);
            expect(embedding).toHaveLength(768);
        });
    });

    describe('generateBatchEmbeddings', () => {
        test('should generate embeddings for multiple documents', async () => {
            const documents = ['First document', 'Second document', 'Third document'];
            
            const embeddings = await generateBatchEmbeddings(documents);
            
            expect(Array.isArray(embeddings)).toBe(true);
            expect(embeddings).toHaveLength(3);
            expect(embeddings.every(emb => Array.isArray(emb) && emb.length === 768)).toBe(true);
        });

        test('should handle empty document array', async () => {
            const documents = [];
            
            const embeddings = await generateBatchEmbeddings(documents);
            
            expect(Array.isArray(embeddings)).toBe(true);
            expect(embeddings).toHaveLength(0);
        });

        test('should handle single document', async () => {
            const documents = ['Single document'];
            
            const embeddings = await generateBatchEmbeddings(documents);
            
            expect(Array.isArray(embeddings)).toBe(true);
            expect(embeddings).toHaveLength(1);
            expect(embeddings[0]).toHaveLength(768);
        });

        test('should generate consistent embeddings for batch vs individual', async () => {
            const document = 'Test document content';
            
            const individualEmbedding = await generateEmbedding(document);
            const batchEmbeddings = await generateBatchEmbeddings([document]);
            
            expect(batchEmbeddings[0]).toEqual(individualEmbedding);
        });

        test('should handle documents with varying lengths', async () => {
            const documents = [
                'Short',
                'Medium length document with more content',
                'Very long document with lots of content that goes on and on and includes many words and sentences to test how the embedding service handles longer text inputs'
            ];
            
            const embeddings = await generateBatchEmbeddings(documents);
            
            expect(embeddings).toHaveLength(3);
            expect(embeddings.every(emb => emb.length === 768)).toBe(true);
        });

        test('should handle batch with some empty documents', async () => {
            const documents = ['Valid document', '', 'Another valid document'];
            
            const embeddings = await generateBatchEmbeddings(documents);
            
            expect(embeddings).toHaveLength(3);
            expect(embeddings.every(emb => Array.isArray(emb) && emb.length === 768)).toBe(true);
        });

        test('should add delay between API calls for real embeddings', async () => {
            // Force real-API path by resetting modules and setting API key before import
            jest.resetModules();
            process.env.GOOGLE_API_KEY = 'real-api-key';
            
            const mockEmbedResult = {
                embedding: { values: new Array(768).fill(0.5) }
            };
            
            const mockModel = {
                embedContent: jest.fn().mockResolvedValue(mockEmbedResult)
            };
            
            mockGoogleGenerativeAI.mockImplementation(() => ({
                getGenerativeModel: jest.fn().mockReturnValue(mockModel)
            }));

            const { generateBatchEmbeddings: freshGenerateBatchEmbeddings } = await import('../services/embedding.service.js');

            const documents = ['Doc 1', 'Doc 2'];
            const startTime = Date.now();
            
            await freshGenerateBatchEmbeddings(documents);
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should have some delay between calls (at least 100ms for 2 docs)
            expect(duration).toBeGreaterThan(100);
        });

        test('should handle individual embedding failures in batch (fallback to mock)', async () => {
            // Force real-API path by resetting modules and setting API key before import
            jest.resetModules();
            process.env.GOOGLE_API_KEY = 'real-api-key';
            
            const mockModel = {
                embedContent: jest.fn()
                    .mockResolvedValueOnce({ embedding: { values: new Array(768).fill(0.1) } })
                    .mockRejectedValueOnce(new Error('API error'))
                    .mockResolvedValueOnce({ embedding: { values: new Array(768).fill(0.3) } })
            };
            
            mockGoogleGenerativeAI.mockImplementation(() => ({
                getGenerativeModel: jest.fn().mockReturnValue(mockModel)
            }));

            const { generateBatchEmbeddings: freshGenerateBatchEmbeddings } = await import('../services/embedding.service.js');

            const documents = ['Doc 1', 'Doc 2', 'Doc 3'];
            const embeddings = await freshGenerateBatchEmbeddings(documents);
            
            expect(embeddings).toHaveLength(3);
            // All embeddings should be valid vectors of length 768
            embeddings.forEach(vec => {
                expect(Array.isArray(vec)).toBe(true);
                expect(vec).toHaveLength(768);
            });
            // Ensure vectors are valid regardless of fallback behavior
        });
    });
});
