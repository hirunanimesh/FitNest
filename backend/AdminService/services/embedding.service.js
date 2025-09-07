import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Check if we should use mock embeddings
const USE_MOCK_EMBEDDINGS = !process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'placeholder-key';

/**
 * Generate mock embeddings for testing purposes
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - Array of mock embedding values
 */
async function generateMockEmbedding(text) {
    // Create a deterministic but pseudo-random embedding based on text content
    const hash = text.split('').reduce((a, b) => {
        a = ((a << 5) - a) + b.charCodeAt(0);
        return a & a;
    }, 0);
    
    // Generate 768-dimensional embedding (same as Google's embedding model)
    const embedding = [];
    for (let i = 0; i < 768; i++) {
        // Use hash and index to create consistent values between -1 and 1
        const value = Math.sin(hash * (i + 1)) * Math.cos(hash / (i + 1));
        embedding.push(value);
    }
    
    // Normalize the vector
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / magnitude);
}

/**
 * Generate real embeddings using Google Generative AI
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - Array of embedding values
 */
async function generateRealEmbedding(text) {
    // Initialize Google Generative AI with API key
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    
    // Use the embedding model
    console.log('generating real embedding');
    const model = genAI.getGenerativeModel({ model: 'embedding-001' });
    
    // Generate embedding
    const result = await model.embedContent(text);
    
    if (!result.embedding || !result.embedding.values) {
        throw new Error('Failed to generate embedding - no values returned');
    }
    
    return result.embedding.values;
}

/**
 * Generate embeddings for text using Google Generative AI or mock data
 * @param {string} text - The text to generate embeddings for
 * @returns {Promise<number[]>} - Array of embedding values
 */
export async function generateEmbedding(text) {
    try {
        if (USE_MOCK_EMBEDDINGS) {
            console.log('🎭 Using mock embeddings for development');
            return await generateMockEmbedding(text);
        } else {
            console.log('🤖 Using Google AI embeddings');
            return await generateRealEmbedding(text);
        }
    } catch (error) {
        console.error('Error generating embedding:', error);
        
        // Fallback to mock embeddings if real embeddings fail
        if (!USE_MOCK_EMBEDDINGS) {
            console.warn('⚠️ Falling back to mock embeddings due to error');
            return await generateMockEmbedding(text);
        }
        
        throw new Error(`Embedding generation failed: ${error.message}`);
    }
}

/**
 * Generate embeddings for multiple documents
 * @param {string[]} documents - Array of document texts
 * @returns {Promise<number[][]>} - Array of embedding arrays
 */
export async function generateBatchEmbeddings(documents) {
    try {
        const embeddings = [];
        
        console.log(`Generating embeddings for ${documents.length} documents...`);
        
        // Process documents one by one to avoid rate limiting
        for (const [index, document] of documents.entries()) {
            console.log(`Processing document ${index + 1}/${documents.length}`);
            const embedding = await generateEmbedding(document);
            embeddings.push(embedding);
            
            // Small delay to avoid hitting rate limits (only for real API)
            if (!USE_MOCK_EMBEDDINGS) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        
        console.log(`✅ Successfully generated ${embeddings.length} embeddings`);
        return embeddings;
    } catch (error) {
        console.error('Error generating batch embeddings:', error);
        throw error;
    }
}
