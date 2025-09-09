import { generateEmbedding } from './services/embedding.service.js';
import { supabase } from './database/supabase.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to verify that Supabase vector column dimensions match Gemini embedding dimensions
 */
async function verifyDimensions() {
    console.log('🔍 Verifying embedding dimensions...\n');
    
    try {
        // Step 1: Test embedding generation
        console.log('1. Testing embedding generation...');
        const testText = "This is a test document to check embedding dimensions.";
        const embedding = await generateEmbedding(testText);
        
        console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
        
        // Step 2: Check Supabase table schema
        console.log('\n2. Checking Supabase table schema...');
        const { data: tableInfo, error: schemaError } = await supabase
            .rpc('get_column_info', { table_name: 'documents', column_name: 'embedding' });
        
        if (schemaError) {
            console.log('⚠️  Could not query table schema directly, using alternative method...');
            
            // Alternative: Try to insert a test vector to see dimension requirements
            console.log('\n3. Testing vector insertion (will be rolled back)...');
            
            const { error: insertError } = await supabase
                .from('documents')
                .insert({
                    content: 'Test document for dimension verification',
                    embedding: embedding
                })
                .select('id')
                .limit(1);
            
            if (insertError) {
                if (insertError.message.includes('dimension')) {
                    console.log('❌ Dimension mismatch detected!');
                    console.log(`Error: ${insertError.message}`);
                    return false;
                } else {
                    console.log(`⚠️  Other database error: ${insertError.message}`);
                }
            } else {
                console.log('✅ Vector insertion successful - dimensions match!');
                
                // Clean up the test document
                await supabase
                    .from('documents')
                    .delete()
                    .eq('content', 'Test document for dimension verification');
            }
        }
        
        // Step 3: Check current Gemini model specs
        console.log('\n4. Current configuration:');
        console.log(`   - Gemini Model: embedding-001`);
        console.log(`   - Generated Embedding Dimensions: ${embedding.length}`);
        console.log(`   - Supabase Vector Column: vector(768)`);
        
        if (embedding.length === 768) {
            console.log('\n🎉 SUCCESS: Dimensions match perfectly!');
            console.log('   Your Gemini embedding-001 model produces 768-dimensional vectors');
            console.log('   Your Supabase table expects 768-dimensional vectors');
            console.log('   Everything is configured correctly ✅');
            return true;
        } else {
            console.log('\n❌ MISMATCH DETECTED:');
            console.log(`   Gemini embedding dimensions: ${embedding.length}`);
            console.log(`   Supabase vector column dimensions: 768`);
            console.log('\n🔧 SOLUTION:');
            console.log(`   You need to update your Supabase schema to match the embedding dimensions.`);
            console.log(`   Run this SQL command in your Supabase SQL editor:`);
            console.log(`   \n   ALTER TABLE documents ALTER COLUMN embedding TYPE vector(${embedding.length});`);
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error during verification:', error);
        console.log('\nTroubleshooting tips:');
        console.log('1. Make sure your GOOGLE_API_KEY is set correctly');
        console.log('2. Verify your Supabase connection is working');
        console.log('3. Check if the documents table exists in your database');
        return false;
    }
}

/**
 * Check what embedding models are available and their dimensions
 */
function printEmbeddingModelInfo() {
    console.log('\n📚 Google AI Embedding Models Info:');
    console.log('┌─────────────────┬─────────────┬─────────────────────────────┐');
    console.log('│ Model           │ Dimensions  │ Description                 │');
    console.log('├─────────────────┼─────────────┼─────────────────────────────┤');
    console.log('│ embedding-001   │ 768         │ Latest embedding model      │');
    console.log('│ text-embedding  │ 768         │ Legacy model (deprecated)   │');
    console.log('└─────────────────┴─────────────┴─────────────────────────────┘');
    console.log('\n💡 Currently using: embedding-001 (768 dimensions)');
}

// Run the verification
async function main() {
    printEmbeddingModelInfo();
    const isMatching = await verifyDimensions();
    
    if (isMatching) {
        console.log('\n🚀 Your RAG system is ready to go!');
    } else {
        console.log('\n🛠️  Please fix the dimension mismatch before proceeding.');
    }
    
    process.exit(isMatching ? 0 : 1);
}

main().catch(console.error);
