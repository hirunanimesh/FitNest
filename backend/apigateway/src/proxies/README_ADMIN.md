# Admin Proxy

This proxy handles all requests to the Admin Service through the API Gateway.

## Route Pattern
- **Pattern**: `/api/admin/*`
- **Target**: Admin Service (http://localhost:3006)
- **Path Rewrite**: Removes `/api/admin` prefix when forwarding

## Supported Endpoints

### Document Management
- `POST /api/admin/documents/upload` - Upload documents with embeddings
- `GET /api/admin/documents` - Get all documents (paginated)
- `GET /api/admin/documents/search` - Search similar documents
- `DELETE /api/admin/documents/:id` - Delete a document

### Health Check
- `GET /api/admin/health` - Admin service health status

## Configuration

The admin proxy is configured in:
- `src/config/index.js` - Service URL configuration
- `src/proxies/adminProxy.js` - Proxy middleware
- `src/utils/serviceHealth.js` - Health monitoring

## Environment Variables

```env
ADMIN_SERVICE_URL=http://localhost:3006
```

## Features

- **Health Monitoring**: Automatic health checks every 30 seconds
- **Error Handling**: Graceful error responses when service is unavailable
- **Logging**: Request/response logging for debugging
- **Timeout**: 60-second timeout for admin operations
- **Path Rewriting**: Automatic URL path transformation

## Usage Example

```javascript
// Frontend API call
const response = await axios.post('http://localhost:3000/api/admin/documents/upload', {
  documents: ['Document content'],
  metadata: [{ title: 'Test', category: 'general' }]
});

// Gets proxied to: http://localhost:3006/documents/upload
```
