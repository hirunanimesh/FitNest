# Chat Functionality Unit Tests

This directory contains comprehensive unit tests for the FitNest chatbot functionality, covering all core components of the chat system.

## Test Coverage

### 🤖 Chat Service Tests (`chat.service.test.js`)
Tests for the core chat logic and RAG implementation:

#### `processChatQuestion` Function
- ✅ Input validation (empty, null, undefined questions)
- ✅ Question trimming and sanitization
- ✅ Embedding generation failure handling
- ✅ Database search failure handling
- ✅ No documents found scenarios
- ✅ Document similarity filtering (threshold: 0.1)
- ✅ Mock AI vs Real AI response generation
- ✅ Context formatting from documents with metadata
- ✅ AI service failure handling with graceful degradation
- ✅ Response structure validation

#### `getChatHealthStatus` Function
- ✅ All services healthy scenario
- ✅ Individual service failure detection
- ✅ Embedding dimension validation (768 dimensions)
- ✅ Database connectivity testing
- ✅ AI service testing (when API key available)
- ✅ Error handling for unexpected failures
- ✅ Health status structure validation

### 🎮 Chat Controller Tests (`chat.controller.test.js`)
Tests for HTTP request/response handling:

#### `chat` Controller
- ✅ Request validation (missing, empty, too long questions)
- ✅ Input sanitization and type checking
- ✅ Successful chat processing
- ✅ Service failure handling
- ✅ Error response formatting
- ✅ Special characters and edge cases
- ✅ Maximum length validation (1000 characters)

#### `chatHealth` Controller  
- ✅ Healthy service status (200 response)
- ✅ Unhealthy service status (503 response)
- ✅ Health check failure (500 response)
- ✅ Missing/invalid health data handling
- ✅ Response structure preservation

### 🧠 Embedding Service Tests (`embedding.service.test.js`)
Tests for text-to-vector conversion:

#### `generateEmbedding` Function
- ✅ Mock embeddings (no API key scenario)
- ✅ Consistent mock generation for same text
- ✅ Different embeddings for different text
- ✅ Vector normalization (magnitude ≈ 1)
- ✅ Real API integration with valid key
- ✅ API failure fallback to mock embeddings
- ✅ Error handling for invalid API responses
- ✅ Edge cases (empty text, very long text, special characters)
- ✅ Null/undefined input handling

#### `generateBatchEmbeddings` Function
- ✅ Multiple document processing
- ✅ Empty array handling
- ✅ Single document processing
- ✅ Consistency with individual embedding generation
- ✅ Variable document lengths
- ✅ API rate limiting (100ms delay between calls)
- ✅ Individual failure handling in batch
- ✅ Large batch processing (100+ documents)

## Running Tests

### Prerequisites
```bash
npm install --save-dev jest
```

### Run All Chat Tests
```bash
npm run test:chat
```

### Run Individual Test Suites
```bash
# Chat service tests only
npm run test:chat:service

# Chat controller tests only  
npm run test:chat:controller

# Embedding service tests only
npm run test:chat:embedding
```

### Watch Mode (Development)
```bash
npm run test:chat:watch
```

### Coverage Report
```bash
npm run test:chat
# Generates coverage report in coverage/chat-tests/
```

## Test Structure

### Mocking Strategy
- **External Services**: GoogleGenerativeAI, Supabase are mocked
- **Internal Services**: Cross-service dependencies are mocked
- **Environment**: API keys and config are controlled per test

### Test Categories
1. **Happy Path**: Normal operation scenarios
2. **Error Handling**: Various failure modes
3. **Edge Cases**: Boundary conditions and unusual inputs
4. **Integration Points**: Service communication
5. **Performance**: Batch processing and delays

### Assertions
- **Functional**: Correct outputs for given inputs
- **Structural**: Response format and data types
- **Behavioral**: Function calls and side effects
- **Performance**: Timing and rate limiting

## Key Test Scenarios

### 🔄 Mock vs Real AI
Tests verify behavior with and without Google API key:
- Mock embeddings: 768-dimensional normalized vectors
- Mock responses: Template-based with question context
- Real API: Actual Google Generative AI integration
- Fallback: Graceful degradation from real to mock

### 📊 Vector Operations
Tests ensure embedding quality:
- Dimension validation (768 for Google's embedding-001)
- Normalization verification (unit vectors)
- Consistency checks (same input → same output)
- Similarity preservation (similar text → similar vectors)

### 🛡️ Error Resilience
Tests verify robust error handling:
- Network failures → Fallback responses
- Invalid inputs → Validation errors  
- Service unavailable → Graceful degradation
- Partial failures → Continue with available data

### 🚀 Performance
Tests ensure acceptable performance:
- Batch processing with rate limiting
- Timeout handling for slow services
- Memory usage for large document sets
- Concurrent request handling

## Coverage Goals

Target coverage metrics:
- **Statements**: > 95%
- **Branches**: > 90% 
- **Functions**: 100%
- **Lines**: > 95%

## Test Data

### Sample Questions
- "What is FitNest?" - General platform query
- "How do I choose a trainer?" - Specific guidance
- Long questions (near 1000 char limit)
- Special characters and emojis
- Empty/whitespace-only inputs

### Mock Documents
- Various similarity scores (0.1 to 0.9)
- Different metadata structures
- Content of varying lengths
- UTF-8 special characters

### Error Scenarios
- Network timeouts
- API quota exceeded
- Database connection failures
- Invalid API responses
- Service unavailability

## Debugging Tests

### Console Output
Tests include detailed logging for debugging:
```bash
npm run test:chat -- --verbose
```

### Individual Test Debugging
```bash
npm run test:chat:service -- --testNamePattern="should handle embedding generation failure"
```

### Coverage Analysis
```bash
npm run test:chat
open coverage/chat-tests/lcov-report/index.html
```

## Continuous Integration

Tests are designed to run in CI/CD environments:
- No external dependencies required
- Deterministic mock data
- Fast execution (< 30 seconds)
- Clear failure reporting

---

## 📈 Test Metrics

- **Total Test Cases**: 80+
- **Test Categories**: 8 main areas
- **Mock Scenarios**: 15+ different configurations  
- **Error Cases**: 20+ failure modes
- **Edge Cases**: 10+ boundary conditions

**Status**: ✅ **Complete Test Coverage**

All chat functionality is thoroughly tested with comprehensive unit tests covering normal operation, error conditions, and edge cases.
