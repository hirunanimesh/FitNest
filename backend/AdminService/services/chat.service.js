import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateEmbedding } from './embedding.service.js';
import { supabase } from '../database/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

// Check if we should use mock responses
const USE_MOCK_AI = !process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'placeholder-key';

/**
 * Generate a mock AI response for testing purposes
 * @param {string} context - The context documents
 * @param {string} question - The user's question
 * @returns {Promise<string>} - Mock AI response
 */
async function generateMockResponse(context, question) {
    const mockResponses = [
        `Based on the gym information provided, I can help answer your question: "${question}". Here's what I found from our records: ${context.substring(0, 100)}...`,
        `Thank you for your question about "${question}". According to our gym documentation: ${context.substring(0, 100)}...`,
        `I understand you're asking about "${question}". From the available gym information: ${context.substring(0, 100)}...`
    ];
    
    const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    return randomResponse;
}



/**
 * Generate AI response using direct REST API approach as fallback
 * @param {string} context - The context documents  
 * @param {string} question - The user's question
 * @returns {Promise<string>} - AI response
 */
async function generateWithRestAPI(context, question) {
    const apiKey = process.env.GOOGLE_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const prompt = `You are a helpful gym management chatbot assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain relevant information to answer the question, politely say so.

Context from gym documents:
${context}

User Question: ${question}

Instructions:
- Only use information from the provided context
- Be helpful and friendly
- If you cannot answer based on the context, say "I don't have enough information in my knowledge base to answer that question"
- Keep responses concise but informative
- Focus on gym-related topics

Answer:`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    if (!response.ok) {
        throw new Error(`REST API failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}

/**
 * Generate a real AI response using Google Gemini
 * @param {string} context - The context documents
 * @param {string} question - The user's question
 * @returns {Promise<string>} - AI response
 */
async function generateRealResponse(context, question) {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    const prompt = `You are a helpful gym management chatbot assistant. Answer the user's question based ONLY on the provided context. If the context doesn't contain relevant information to answer the question, politely say so.

Context from gym documents:
${context}

User Question: ${question}

Instructions:
- Only use information from the provided context
- Be helpful and friendly
- If you cannot answer based on the context, say "I don't have enough information in my knowledge base to answer that question"
- Keep responses concise but informative
- Focus on gym-related topics

Answer:`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
}

/**
 * Process a chat question using RAG (Retrieval-Augmented Generation)
 * @param {string} question - The user's question
 * @returns {Promise<Object>} - Chat response object
 */
export async function processChatQuestion(question) {
    try {
        // Validate input
        if (!question || typeof question !== 'string' || question.trim().length === 0) {
            throw new Error('Question is required and must be a non-empty string');
        }

        const trimmedQuestion = question.trim();

        // Step 1: Generate embedding for the question
        const queryEmbedding = await generateEmbedding(trimmedQuestion);

        // Step 2: Retrieve relevant documents using Supabase RPC function
        
        const { data: relevantDocs, error: searchError } = await supabase.rpc('match_documents', {
            query_embedding: queryEmbedding,
            match_count: 3
        });

        if (searchError) {
            throw new Error(`Document search failed: ${searchError.message}`);
        }

        if (!relevantDocs || relevantDocs.length === 0) {
            return {
                success: true,
                answer: "I don't have enough information in my knowledge base to answer that question. Please make sure relevant gym information has been added to the system.",
                sources: [],
                similarity_scores: [],
                sources_count: 0
            };
        }

        // Step 3: Build context from retrieved documents
        const context = relevantDocs
            .filter(doc => doc.similarity > 0.1) // Filter out very low similarity matches
            .map((doc, index) => {
                const metadata = doc.metadata || {};
                const title = metadata.title || metadata.category || `Document ${index + 1}`;
                return `[${title}]: ${doc.content}`;
            })
            .join('\n\n');

        if (!context.trim()) {
            return {
                success: true,
                answer: "I found some related information but it doesn't seem relevant enough to answer your question confidently.",
                sources: [],
                similarity_scores: [],
                sources_count: 0
            };
        }

        // Step 4: Generate AI response
        let answer;
        
        if (USE_MOCK_AI) {
            answer = await generateMockResponse(context, trimmedQuestion);
        } else {
            answer = await generateRealResponse(context, trimmedQuestion);
        }

        return {
            success: true,
            answer: answer,
            sources: relevantDocs.map(doc => doc.content),
            similarity_scores: relevantDocs.map(doc => doc.similarity),
            sources_count: relevantDocs.length
        };

    } catch (error) {
        console.error('Error in processChatQuestion:', error);
        
        // Return graceful error response
        return {
            success: false,
            error: `Chat processing failed: ${error.message}`,
            answer: "I'm sorry, I encountered an error while processing your question. Please try again later."
        };
    }
}

/**
 * Get chat health status
 * @returns {Promise<Object>} - Health status object
 */
export async function getChatHealthStatus() {
    try {
        // Test embedding generation
        const testEmbedding = await generateEmbedding("test query");
        const embeddingWorking = Array.isArray(testEmbedding) && testEmbedding.length === 768;

        // Test database connection
        const { data, error } = await supabase.from('documents').select('count').limit(1);
        const databaseWorking = !error;

        // Test AI service (if using real API)
        let aiWorking = true;
        if (!USE_MOCK_AI) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
                const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
                await model.generateContent("test");
            } catch (aiError) {
                aiWorking = false;
            }
        }

        return {
            success: true,
            services: {
                embedding: embeddingWorking,
                database: databaseWorking,
                ai: aiWorking,
                mode: USE_MOCK_AI ? 'development (mock)' : 'production (real AI)'
            },
            ready: embeddingWorking && databaseWorking && aiWorking
        };

    } catch (error) {
        console.error('Error in getChatHealthStatus:', error);
        return {
            success: false,
            error: error.message,
            ready: false
        };
    }
}

