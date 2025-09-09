# Admin Service

A Node.js microservice for managing documents with embeddings for RAG (Retrieval Augmented Generation) using Google Generative AI and Supabase.

## Features

- **Document Upload**: Upload documents with automatic embedding generation
- **Semantic Search**: Search for similar documents using vector similarity
- **Document Management**: List, view, and delete documents
- **Batch Processing**: Handle multiple documents in a single request
- **Vector Storage**: Store embeddings in Supabase with pgvector

## API Endpoints

### Health Check
- `GET /health` - Service health check

### Document Management
- `POST /documents/upload` - Upload documents with embeddings
- `GET /documents/search?query=<query>&limit=<limit>` - Search similar documents
- `GET /documents?page=<page>&limit=<limit>` - Get all documents (paginated)
- `DELETE /documents/:id` - Delete a document by ID

## Request Examples

### Upload Documents
```bash
POST /documents/upload
Content-Type: application/json

{
  "documents": [
    "This is the first document content...",
    "This is the second document content..."
  ],
  "metadata": [
    {"title": "Document 1", "category": "fitness"},
    {"title": "Document 2", "category": "nutrition"}
  ]
}
```

### Search Documents
```bash
GET /documents/search?query=fitness+tips&limit=5
```

### Get Documents
```bash
GET /documents?page=1&limit=10
```

## Environment Variables

Create a `.env` file with:

```env
PORT=3006
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GOOGLE_API_KEY=your_google_ai_api_key
NODE_ENV=development
```

### Google AI Setup

To use real Google AI embeddings:

1. **Enable the Generative Language API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the "Generative Language API"
   - Create an API key

2. **Set the API key**:
   ```env
   GOOGLE_API_KEY=your_actual_api_key_here
   ```

### Development Mode (Mock Embeddings)

For development and testing without Google AI setup:

```env
GOOGLE_API_KEY=placeholder-key
```

The service will automatically use mock embeddings when:
- `GOOGLE_API_KEY` is not set
- `GOOGLE_API_KEY` is set to `placeholder-key`
- Google AI API calls fail

Mock embeddings are deterministic and based on text content, making them suitable for development and testing.

## Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (see above)

3. Run database migrations to create the documents table:
```sql
-- Run the SQL in database/schema.sql on your Supabase instance
```

4. Start the service:
```bash
# Development
npm run dev

# Production
npm start
```

## Database Schema

The service uses a `documents` table with the following structure:

```sql
CREATE TABLE documents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(768), -- Google Generative AI embedding dimension
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Dependencies

- `@google/generative-ai` - Google Generative AI for embeddings
- `@supabase/supabase-js` - Supabase client
- `express` - Web framework
- `joi` - Request validation
- `cors` - Cross-origin resource sharing
- `helmet` - Security headers

## Testing

Run tests:
```bash
npm test
```

## Docker

Build and run with Docker:
```bash
# Build
docker build -t admin-service .

# Run
docker run -p 3005:3005 --env-file .env admin-service
```

## Notes

- Maximum document size: 50KB per document
- Maximum batch size: 100 documents per request
- Embedding dimension: 768 (Google Generative AI)
- Default similarity threshold: 0.7
- Request timeout: Varies based on document count and size
