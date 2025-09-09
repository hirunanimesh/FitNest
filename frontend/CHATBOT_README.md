# FitNest AI Chatbot Implementation

## Overview
The FitNest AI Chatbot is a smart assistant powered by Google's Gemini AI and RAG (Retrieval Augmented Generation) technology. It provides users with fitness advice, platform information, and answers to their questions using our knowledge base.

## Features

### ✨ User Experience
- **Fixed Floating Button**: Always visible in bottom-right corner
- **Responsive Design**: Adapts to mobile and desktop screens
- **Smooth Animations**: Typing indicators and message transitions
- **Auto-scroll**: Messages automatically scroll to bottom
- **Quick Access**: One-click to open/close chat

### 🤖 AI Capabilities
- **RAG-powered responses**: Uses document embeddings for accurate answers
- **Context awareness**: Maintains conversation context
- **Source citations**: Shows which documents were used for answers
- **Fallback handling**: Graceful error handling with helpful messages

### 🎨 Design Features
- **Dark/Light mode support**: Uses your app's theme
- **Custom animations**: Bouncing typing indicator
- **Professional UI**: Consistent with your design system
- **Mobile optimized**: Full-screen on mobile devices

## Implementation

### 1. Components Created

#### `Chatbot.tsx`
- Main chatbot component with full UI
- Located: `frontend/components/Chatbot.tsx`
- Features: Message history, typing indicators, source citations

#### API Integration
- Added `ChatWithAI()` function to `frontend/api/admin/route.tsx`
- Connects to AdminService chat endpoint
- Handles error states and responses

#### Styling
- Custom CSS animations in `globals.css`
- Mobile-responsive design
- Smooth transitions and hover effects

### 2. Layout Integration

The chatbot is automatically added to every page via `layout.tsx`:

```tsx
<AuthProvider>
  {children}
  <Toaster />
  <Footer />
  <Chatbot />
</AuthProvider>
```

## Usage

### For Users
1. **Access**: Click the chat icon (💬) in the bottom-right corner
2. **Ask Questions**: Type fitness-related questions or platform queries
3. **View Sources**: See which documents were used for answers
4. **Clear Chat**: Use the trash icon to start fresh
5. **Close**: Click the X button or chat icon again

### Sample Questions
- "What are the best exercises for weight loss?"
- "How do I choose a personal trainer?"
- "Tell me about FitNest's subscription plans"
- "What equipment do I need for home workouts?"

## Configuration

### Environment Variables
Make sure your API Gateway is properly configured:
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

### Backend Requirements
- AdminService must be running on port 3006
- Google API key configured for embeddings
- Supabase database with documents table
- Chat endpoint available at `/api/admin/chat`

## Customization

### Styling
Modify chatbot appearance in `globals.css`:
```css
.chatbot-container { /* Main container */ }
.chatbot-fab { /* Floating action button */ }
.chatbot-message { /* Individual messages */ }
```

### Behavior
Adjust chatbot behavior in `Chatbot.tsx`:
- Change welcome message
- Modify typing delay (currently 1000ms)
- Customize error messages
- Add new features

### Mobile Responsiveness
The chatbot automatically adapts to mobile screens:
- Full-screen chat on mobile
- Smaller floating button
- Touch-friendly interactions

## Technical Details

### State Management
- Uses React hooks for state management
- Message history stored in component state
- Loading states for better UX

### API Integration
- Connects to AdminService via API Gateway
- Handles response parsing and error states
- Includes source citation processing

### Performance
- Lazy loading of messages
- Efficient scroll handling
- Optimized re-renders with React best practices

## Troubleshooting

### Common Issues

1. **Chat button not visible**
   - Check if Chatbot component is imported in layout.tsx
   - Verify z-index conflicts with other elements

2. **Messages not sending**
   - Ensure AdminService is running
   - Check API Gateway configuration
   - Verify CORS settings

3. **Styling issues**
   - Check Tailwind CSS compilation
   - Verify globals.css is imported
   - Review responsive breakpoints

### Error Messages
The chatbot handles various error states:
- API connection errors
- Invalid responses
- Network timeouts
- Service unavailability

## Future Enhancements

### Planned Features
- **Message persistence**: Save chat history
- **User authentication**: Personalized responses
- **Voice input**: Speech-to-text support
- **File uploads**: Share images/documents
- **Quick replies**: Suggested responses
- **Multi-language**: Support multiple languages

### Advanced Features
- **Analytics**: Track popular questions
- **A/B testing**: Test different UI variations
- **Integration**: Connect with other services
- **Notifications**: Push notifications for responses

## Development

### Testing
```bash
# Run frontend development server
cd frontend
npm run dev

# Test chatbot functionality
# 1. Open browser to localhost:3000
# 2. Click chat icon
# 3. Send test message
# 4. Verify response and sources
```

### Deployment
The chatbot is automatically deployed with your Next.js application. No additional setup required.

---

**Status**: ✅ **Ready for Production**

The chatbot is fully functional and integrated into your FitNest application. Users can now access AI-powered fitness assistance on every page!
