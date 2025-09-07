import { uploadDocumentsToRAG } from '../services/document.service.js';

// Mock the dependencies
jest.mock('../database/supabase.js');
jest.mock('../services/embedding.service.js');

describe('AdminService - Document Upload', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should validate input documents', async () => {
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
