# Email Notification Service for Verification System

This document describes the email notification system that sends automated emails when gym or trainer verification requests are approved or rejected.

## Overview

The email notification system automatically sends professional emails to users when their verification status changes, improving user experience and communication.

## Components

### 1. EmailService (`services/EmailService.js`)
A dedicated service class that handles all email operations using SendGrid.

**Features:**
- ✅ Professional HTML email templates with FitNest branding
- ✅ Plain text fallback for email clients that don't support HTML
- ✅ Separate templates for approved and rejected verifications
- ✅ Customizable content based on entity type (gym/trainer)
- ✅ Error handling and logging

**Methods:**
- `sendVerificationApprovedEmail(email, name, entityType, entityName)` - Sends approval notification
- `sendVerificationRejectedEmail(email, name, entityType, entityName, reason)` - Sends rejection notification

### 2. Updated Admin Service (`services/admin.service.js`)
Modified the `handleVerificationState` function to fetch user email details from the database.

**Changes:**
- ✅ Fetches user details (email, name) from verification records
- ✅ Returns both verification update result and user details
- ✅ Uses existing `get_gym_verifications` and `get_trainer_verifications` RPC functions

### 3. Updated Admin Controller (`controllers/admin.controller.js`)
Enhanced the verification endpoint to send email notifications.

**Changes:**
- ✅ Imported EmailService
- ✅ Sends appropriate email based on verification state (Approved/Rejected)
- ✅ Gracefully handles email failures without affecting verification updates
- ✅ Comprehensive logging for debugging

## Configuration Required

### Environment Variables
Add these to your `.env` file in the AdminService directory:

```env
# SendGrid Configuration
SENDGRID_API_KEY=your_sendgrid_api_key_here
FROM_EMAIL=noreply@fitnest.com

# Frontend URL (for links in emails)
FRONTEND_URL=https://your-frontend-domain.com
```

### SendGrid Setup
1. Sign up for a SendGrid account
2. Create an API key with "Mail Send" permissions
3. Verify your sender email address
4. Add the API key to your environment variables

## Email Templates

### Approval Email
- **Subject:** 🎉 Your [gym/trainer] Verification Has Been Approved!
- **Content:** Congratulatory message with next steps
- **CTA:** "Go to Dashboard" button

### Rejection Email
- **Subject:** ❌ Your [gym/trainer] Verification Request Update
- **Content:** Professional explanation with feedback (if provided)
- **CTA:** "Update & Resubmit" button

## API Endpoint

The existing verification endpoint now includes email notifications:

```
PUT /handle-verifications/:id/:state/:type/:entityId
```

**Parameters:**
- `id` - Verification record ID
- `state` - "Approved" or "Rejected"
- `type` - "gym" or "trainer"
- `entityId` - The gym_id or trainer_id

**Optional Body (for rejections):**
```json
{
  "reason": "Additional information needed for license verification"
}
```

## Error Handling

- Email failures don't affect verification updates
- All email errors are logged for debugging
- The API responds successfully even if email sending fails
- Users will still see their verification status updated in the dashboard

## Testing

To test the email functionality:

1. Ensure SendGrid API key is configured
2. Use the admin dashboard to approve/reject a verification
3. Check the console logs for email sending status
4. Verify the email is received in the user's inbox

## Troubleshooting

**Common Issues:**
- **SendGrid API key not configured:** Check environment variables
- **Sender email not verified:** Verify your sender email in SendGrid dashboard
- **Emails going to spam:** Ensure SPF/DKIM records are configured in SendGrid
- **User email not found:** Check if verification records have valid applicant_email

**Debugging:**
- Check console logs for detailed error messages
- Verify database queries return user details
- Test SendGrid API key with a simple email first

## Future Enhancements

- 📧 Add email templates for other notification types
- 🌐 Multi-language email support
- 📊 Email delivery tracking and analytics
- 🎨 More customizable email templates
- 📱 SMS notification integration