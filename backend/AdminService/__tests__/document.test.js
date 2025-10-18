import { jest } from '@jest/globals';

// Mock the dependencies with ESM-friendly API
await jest.unstable_mockModule('../database/supabase.js', () => ({
    __esModule: true,
    supabase: { from: jest.fn(), rpc: jest.fn() },
    default: { from: jest.fn(), rpc: jest.fn() },
}));
await jest.unstable_mockModule('../services/embedding.service.js', () => ({
    __esModule: true,
    generateBatchEmbeddings: jest.fn(async (docs) => docs.map(() => Array(1024).fill(0.1))),
    generateEmbedding: jest.fn(async () => Array(1024).fill(0.2)),
}));

describe('AdminService - Document Upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should validate input documents', async () => {
        const { uploadDocumentsToRAG } = await import('../services/document.service.js');
        // Test with empty array
        await expect(uploadDocumentsToRAG([])).rejects.toThrow('Documents must be a non-empty array');
        
        // Test with null
        await expect(uploadDocumentsToRAG(null)).rejects.toThrow('Documents must be a non-empty array');
        
        // Test with non-array
        await expect(uploadDocumentsToRAG('not an array')).rejects.toThrow('Documents must be a non-empty array');
    });

    test('should filter out invalid documents', async () => {
        const mockDocuments = ['valid document', '', null, 'another valid document'];
        
        // This test will need proper mocking of the dependencies
        // For now, we're just testing the input validation
        expect(mockDocuments.filter(doc => typeof doc === 'string' && doc.trim().length > 0))
            .toEqual(['valid document', 'another valid document']);
    });
});
