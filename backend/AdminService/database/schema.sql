-- Create documents table for RAG (Retrieval Augmented Generation)
CREATE TABLE IF NOT EXISTS documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(768), -- Google Generative AI embedding dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on embedding column for similarity search
CREATE INDEX IF NOT EXISTS documents_embedding_idx ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS documents_created_at_idx ON documents (created_at DESC);

-- Create index on metadata for filtering (if needed)
CREATE INDEX IF NOT EXISTS documents_metadata_idx ON documents USING gin (metadata);

-- Create a function to search for similar documents
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  created_at timestamp with time zone
)
LANGUAGE sql STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) as similarity,
    documents.created_at
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE
ON documents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable Row Level Security (RLS) - optional, depends on your security requirements
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users (adjust as needed)
-- CREATE POLICY "Allow authenticated users to read documents" ON documents
--     FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy for service role (full access)
-- CREATE POLICY "Allow service role full access to documents" ON documents
--     FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE documents IS 'Table storing documents with embeddings for RAG (Retrieval Augmented Generation)';
COMMENT ON COLUMN documents.id IS 'Unique identifier for the document';
COMMENT ON COLUMN documents.content IS 'The actual text content of the document';
COMMENT ON COLUMN documents.embedding IS 'Vector embedding generated from the document content';
COMMENT ON COLUMN documents.metadata IS 'Additional metadata about the document (JSON format)';
COMMENT ON COLUMN documents.created_at IS 'Timestamp when the document was created';
COMMENT ON COLUMN documents.updated_at IS 'Timestamp when the document was last updated';
