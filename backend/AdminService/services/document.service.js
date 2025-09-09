
import { generateBatchEmbeddings } from './embedding.service.js';
import { supabase } from '../database/supabase.js';
/**
 * Upload documents to Supabase with embeddings for RAG
 * @param {string[]} documents - Array of document texts
 * @param {Object[]} metadata - Optional metadata array for each document
 * @returns {Promise<Object>} - Success message and inserted document IDs
 */
export async function uploadDocumentsToRAG(documents, metadata = []) {
    try {
        // Validate input
        if (!Array.isArray(documents) || documents.length === 0) {
            throw new Error('Documents must be a non-empty array');
        }

        // Ensure all documents are strings and not empty
        const validDocuments = documents.filter(doc => 
            typeof doc === 'string' && doc.trim().length > 0
        );

        if (validDocuments.length === 0) {
            throw new Error('No valid documents provided');
        }

        console.log(`Processing ${validDocuments.length} documents for embeddings...`);
        
        // Generate embeddings for all documents
        const embeddings = await generateBatchEmbeddings(validDocuments);
        
        
        if (embeddings.length !== validDocuments.length) {
            throw new Error('Mismatch between documents and embeddings count');
        }

        console.log('Embeddings generated successfully, uploading to Supabase...');

        // Prepare documents for insertion
        const documentsToInsert = validDocuments.map((content, index) => ({
            content: content,
            embedding: embeddings[index],
            metadata: metadata[index] || {}
        }));
        
        // Insert documents one by one to handle potential conflicts better
        const insertedIds = [];
        const errors = [];
       
        for (let i = 0; i < documentsToInsert.length; i++) {
            try {
                const { data, error } = await supabase
                    .from('documents')
                    .insert([documentsToInsert[i]])
                    .select('id')
                    .single();

                if (error) {
                    console.error(`Error inserting document ${i + 1}:`, error);
                    errors.push({ index: i, error: error.message });
                } else {
                    insertedIds.push(data.id);
                    console.log(`Document ${i + 1} inserted with ID: ${data.id}`);
                }
            } catch (insertError) {
                console.error(`Exception inserting document ${i + 1}:`, insertError);
                errors.push({ index: i, error: insertError.message });
            }

            // Small delay between inserts
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // Return results
        const result = {
            success: true,
            message: `Successfully processed ${insertedIds.length} out of ${validDocuments.length} documents`,
            insertedCount: insertedIds.length,
            insertedIds: insertedIds,
            totalDocuments: validDocuments.length,
            errors: errors.length > 0 ? errors : undefined
        };

        console.log('Upload completed:', result);
        return result;

    } catch (error) {
        console.error('Error in uploadDocumentsToRAG:', error);
        throw new Error(`Failed to upload documents: ${error.message}`);
    }
}

/**
 * Search for similar documents using embedding similarity
 * @param {string} query - The search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Object[]>} - Array of similar documents
 */
export async function searchSimilarDocuments(query, limit = 5) {
    try {
        // Generate embedding for the query
        const { generateEmbedding } = await import('./embedding.service.js');
        const queryEmbedding = await generateEmbedding(query);

        // Search for similar documents using Supabase's vector similarity
        const { data, error } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_count: limit
        });

        if (error) {
            throw new Error(`Search failed: ${error.message}`);
        }

        return {
            success: true,
            results: data || [],
            count: data ? data.length : 0
        };

    } catch (error) {
        console.error('Error in searchSimilarDocuments:', error);
        throw new Error(`Search failed: ${error.message}`);
    }
}

/**
 * Get all documents with pagination
 * @param {number} page - Page number (starts from 1)
 * @param {number} limit - Number of documents per page
 * @returns {Promise<Object>} - Paginated documents
 */
export async function getAllDocuments(page = 1, limit = 10) {
    try {
        const offset = (page - 1) * limit;

        const { data, error, count } = await supabase
            .from('documents')
            .select('id, content, metadata', { count: 'exact' })
            .range(offset, offset + limit - 1);

        if (error) {
            throw new Error(`Failed to fetch documents: ${error.message}`);
        }

        return {
            success: true,
            documents: data || [],
            pagination: {
                currentPage: page,
                totalCount: count,
                totalPages: Math.ceil(count / limit),
                hasNextPage: offset + limit < count,
                hasPreviousPage: page > 1
            }
        };

    } catch (error) {
        console.error('Error in getAllDocuments:', error);
        throw new Error(`Failed to fetch documents: ${error.message}`);
    }
}

/**
 * Delete a document by ID
 * @param {string} documentId - The ID of the document to delete
 * @returns {Promise<Object>} - Success message
 */
export async function deleteDocument(documentId) {
    try {
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', documentId);

        if (error) {
            throw new Error(`Failed to delete document: ${error.message}`);
        }

        return {
            success: true,
            message: `Document ${documentId} deleted successfully`
        };

    } catch (error) {
        console.error('Error in deleteDocument:', error);
        throw new Error(`Failed to delete document: ${error.message}`);
    }
}
