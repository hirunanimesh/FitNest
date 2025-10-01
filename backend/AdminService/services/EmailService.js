import sgMail from '@sendgrid/mail';

class EmailService {
    constructor() {
        // Set the SendGrid API key from environment variables
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        // Default sender email - you should set this to your verified sender in SendGrid
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@fitnest.com';
    }

    /**
     * Send verification approved email
     * @param {string} userEmail - Recipient email address
     * @param {string} userName - User's name
     * @param {string} entityType - Type of entity (gym/trainer)
     * @param {string} entityName - Name of the gym/trainer
     */
    async sendVerificationApprovedEmail(userEmail, userName, entityType, entityName) {
        try {
            console.log('SendGrid configuration check:');
            console.log('- API Key set:', !!process.env.SENDGRID_API_KEY);
            console.log('- From email:', this.fromEmail);
            console.log('- To email:', userEmail);

            const msg = {
                to: userEmail,
                from: this.fromEmail,
                subject: `🎉 Your ${entityType} Verification Has Been Approved!`,
                html: this.getApprovedEmailTemplate(userName, entityType, entityName),
                text: this.getApprovedEmailText(userName, entityType, entityName)
                // Sandbox mode disabled - emails will be sent to real inboxes
            };

            const response = await sgMail.send(msg);
            console.log('Verification approved email sent successfully:', response[0].statusCode);
            return { success: true, messageId: response[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Error sending verification approved email:', error);
            if (error.response && error.response.body && error.response.body.errors) {
                console.error('SendGrid detailed error:', JSON.stringify(error.response.body.errors, null, 2));
            }
            throw new Error(`Failed to send verification approved email: ${error.message}`);
        }
    }

    /**
     * Send verification rejected email
     * @param {string} userEmail - Recipient email address
     * @param {string} userName - User's name
     * @param {string} entityType - Type of entity (gym/trainer)
     * @param {string} entityName - Name of the gym/trainer
     * @param {string} reason - Reason for rejection (optional)
     */
    async sendVerificationRejectedEmail(userEmail, userName, entityType, entityName, reason = null) {
        try {
            const msg = {
                to: userEmail,
                from: this.fromEmail,
                subject: `❌ Your ${entityType} Verification Request Update`,
                html: this.getRejectedEmailTemplate(userName, entityType, entityName, reason),
                text: this.getRejectedEmailText(userName, entityType, entityName, reason)
                // Sandbox mode disabled - emails will be sent to real inboxes
            };

            const response = await sgMail.send(msg);
            console.log('Verification rejected email sent successfully:', response[0].statusCode);
            return { success: true, messageId: response[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Error sending verification rejected email:', error);
            throw new Error(`Failed to send verification rejected email: ${error.message}`);
        }
    }

    /**
     * HTML template for approved verification email
     */
    getApprovedEmailTemplate(userName, entityType, entityName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Approved - FitNest</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-icon { font-size: 48px; margin-bottom: 20px; }
                .cta-button { display: inline-block; background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="success-icon">🎉</div>
                <h1>Congratulations!</h1>
                <p>Your verification has been approved</p>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>Great news! Your <strong>${entityType}</strong> verification request for "<strong>${entityName}</strong>" has been successfully approved by our admin team.</p>
                
                <p><strong>What this means:</strong></p>
                <ul>
                    <li>✅ Your ${entityType} profile is now verified and active</li>
                    <li>✅ You have full access to all FitNest features</li>
                    <li>✅ Your ${entityType} will appear in search results</li>
                    <li>✅ Users can now book and interact with your services</li>
                </ul>

                <p>You can now log in to your dashboard and start managing your ${entityType} profile.</p>
                
                <a href="${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard" class="cta-button">
                    Go to Dashboard
                </a>

                <p>Thank you for choosing FitNest. We're excited to have you as part of our fitness community!</p>
                
                <p>Best regards,<br>
                The FitNest Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>If you have questions, contact us at support@fitnest.com</p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Plain text version for approved verification email
     */
    getApprovedEmailText(userName, entityType, entityName) {
        return `
🎉 Congratulations! Your verification has been approved

Hello ${userName}!

Great news! Your ${entityType} verification request for "${entityName}" has been successfully approved by our admin team.

What this means:
✅ Your ${entityType} profile is now verified and active
✅ You have full access to all FitNest features
✅ Your ${entityType} will appear in search results
✅ Users can now book and interact with your services

You can now log in to your dashboard and start managing your ${entityType} profile.

Dashboard: ${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard

Thank you for choosing FitNest. We're excited to have you as part of our fitness community!

Best regards,
The FitNest Team

---
This is an automated message. Please do not reply to this email.
If you have questions, contact us at support@fitnest.com
        `;
    }

    /**
     * HTML template for rejected verification email
     */
    getRejectedEmailTemplate(userName, entityType, entityName, reason) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Update - FitNest</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .warning-icon { font-size: 48px; margin-bottom: 20px; }
                .cta-button { display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .reason-box { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="warning-icon">📋</div>
                <h1>Verification Update Required</h1>
                <p>Your submission needs attention</p>
            </div>
            <div class="content">
                <h2>Hello ${userName},</h2>
                <p>Thank you for submitting your <strong>${entityType}</strong> verification request for "<strong>${entityName}</strong>".</p>
                
                <p>After reviewing your submission, our admin team has determined that additional information or corrections are needed before we can approve your verification.</p>

                ${reason ? `
                <div class="reason-box">
                    <h3>📝 Feedback from our team:</h3>
                    <p>${reason}</p>
                </div>
                ` : ''}

                <p><strong>Next steps:</strong></p>
                <ul>
                    <li>📋 Review the feedback provided above</li>
                    <li>🔄 Update your ${entityType} information as needed</li>
                    <li>📤 Resubmit your verification request</li>
                    <li>⏰ Our team will review your updated submission</li>
                </ul>

                <p>Don't worry - you can update your information and resubmit for verification at any time.</p>
                
                <a href="${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard" class="cta-button">
                    Update & Resubmit
                </a>

                <p>If you have questions about the feedback or need assistance, please don't hesitate to contact our support team.</p>
                
                <p>Best regards,<br>
                The FitNest Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>If you have questions, contact us at support@fitnest.com</p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Plain text version for rejected verification email
     */
    getRejectedEmailText(userName, entityType, entityName, reason) {
        return `
📋 Verification Update Required - Your submission needs attention

Hello ${userName},

Thank you for submitting your ${entityType} verification request for "${entityName}".

After reviewing your submission, our admin team has determined that additional information or corrections are needed before we can approve your verification.

${reason ? `
📝 Feedback from our team:
${reason}
` : ''}

Next steps:
📋 Review the feedback provided above
🔄 Update your ${entityType} information as needed
📤 Resubmit your verification request
⏰ Our team will review your updated submission

Don't worry - you can update your information and resubmit for verification at any time.

Dashboard: ${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard

If you have questions about the feedback or need assistance, please don't hesitate to contact our support team.

Best regards,
The FitNest Team

---
This is an automated message. Please do not reply to this email.
If you have questions, contact us at support@fitnest.com
        `;
    }
}

export default EmailService;