# Gym Plan Email Notification System

This document describes the email notification system for gym plan management in the FitNest application.

## Overview

The gym plan email notification system automatically sends professional emails to relevant parties when gym plans are created or when trainers are assigned to plans.

## Features

### 1. Plan Creation Notifications
When a gym owner creates a new plan, they receive a congratulatory email with:
- Plan details (name, price, duration)
- Gym information
- Next steps and dashboard links
- Professional FitNest branding

### 2. Trainer Assignment Notifications
When trainers are assigned to a gym plan, each trainer receives:
- Assignment notification
- Plan details and gym information
- Responsibilities and expectations
- Dashboard access links

## Architecture

### Backend Components

#### 1. GymPlanEmailService (`/backend/GymService/services/GymPlanEmailService.js`)
Central service handling all gym plan email operations:

**Key Methods:**
- `sendPlanCreationEmail()` - Sends confirmation to gym owner
- `sendTrainerAssignmentEmail()` - Notifies assigned trainers
- `getGymOwnerDetails()` - Fetches gym owner information
- `getTrainerDetails()` - Fetches trainer information

**Features:**
- Professional HTML email templates
- Plain text fallbacks
- SendGrid integration
- Error handling and logging
- Database integration for user details

#### 2. Updated Controllers (`/backend/GymService/controllers/plans.controller.js`)

**addGymPlan:**
- Creates gym plan
- Sends confirmation email to gym owner
- Handles email failures gracefully

**assignTrainersToPlan:**
- Assigns trainers to plan
- Sends notification emails to all assigned trainers
- Batches email sending for multiple trainers

### Frontend Integration

#### Updated Plans Page (`/frontend/app/dashboard/gym/plans/page.tsx`)
- Integrates with CreateGymPlan API
- Shows success notifications with email confirmation
- Handles API errors gracefully

## Email Templates

### Plan Creation Email
**Subject:** 🎉 New Gym Plan Created Successfully - [Plan Name]

**Content:**
- Congratulatory header with success icon
- Plan details in organized format
- Next steps for gym management
- Dashboard link for plan management
- Professional footer with support information

### Trainer Assignment Email
**Subject:** 🏋️ You've Been Assigned to a New Gym Plan - [Gym Name]

**Content:**
- Assignment notification with gym branding
- Detailed plan information
- Trainer responsibilities
- Next steps for getting started
- Trainer dashboard access link

## Configuration

### Environment Variables (GymService)
```env
# Email Configuration
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=your_verified_sender_email
FRONTEND_URL=http://localhost:3000
```

### Required Setup
1. SendGrid account with verified sender email
2. API key with Mail Send permissions
3. Frontend URL for dashboard links

## API Endpoints

### Create Gym Plan with Email Notifications
```
POST /api/gym/addgymplan
```

**Request Body:**
```json
{
  "title": "Premium Plan",
  "price": 50,
  "description": "Premium gym access with personal training",
  "duration": 30,
  "gymid": 123
}
```

**Process:**
1. Creates gym plan in database
2. Triggers Kafka producer
3. Sends email notification to gym owner
4. Returns success response

### Assign Trainers with Email Notifications
```
POST /api/gym/assign-trainers-to-plan
```

**Request Body:**
```json
{
  "plan_id": 456,
  "trainer_ids": [1, 2, 3]
}
```

**Process:**
1. Assigns trainers to plan
2. Fetches trainer and gym details
3. Sends notification email to each trainer
4. Returns success response

## Database Integration

The email service integrates with these tables:
- `gym` - Gym details and owner information
- `users` - User email addresses
- `trainer` - Trainer information
- `Gym_plans` - Plan details

## Error Handling

- Email failures don't affect core functionality
- Comprehensive logging for debugging
- Graceful degradation if email service unavailable
- Individual trainer email failures don't stop batch processing

## Testing

### Manual Testing
1. Create a new gym plan through the frontend
2. Verify gym owner receives creation email
3. Assign trainers to the plan
4. Verify trainers receive assignment emails

### Email Content Testing
- Check email rendering in different clients
- Verify all links work correctly
- Confirm professional appearance
- Test both HTML and plain text versions

## Future Enhancements

- 📧 Plan update notifications
- 🔄 Plan cancellation notifications
- 📊 Weekly/monthly plan performance reports
- 🌐 Multi-language support
- 📱 SMS notifications
- 🎨 Customizable email templates per gym

## Troubleshooting

### Common Issues

**Emails not being sent:**
- Check SendGrid API key configuration
- Verify sender email is verified in SendGrid
- Check console logs for detailed errors

**Database connection errors:**
- Verify Supabase configuration
- Check if required tables exist
- Confirm user has proper permissions

**Template rendering issues:**
- Check environment variables for frontend URL
- Verify template data is being passed correctly
- Test with different email clients

### Debug Logging

The service provides detailed console logging:
```
Sending plan creation email to gym owner: owner@example.com
Plan creation email sent successfully to gym owner
Assignment email sent successfully to trainer: John Doe
```

## Security Considerations

- Email addresses are fetched securely from database
- SendGrid API key stored in environment variables
- No sensitive data exposed in email templates
- Proper error handling prevents information leakage

## Performance

- Asynchronous email sending doesn't block API responses
- Batch processing for multiple trainer notifications
- Graceful error handling for individual email failures
- Optimized database queries for user details