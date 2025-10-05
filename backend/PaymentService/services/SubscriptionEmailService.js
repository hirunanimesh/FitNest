import sgMail from '@sendgrid/mail';
import axios from 'axios';

class SubscriptionEmailService {
    constructor() {
        // Set the SendGrid API key from environment variables
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        // Default sender email
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@fitnest.com';
        
        // Service URLs
        this.GYM_SERVICE_URL = process.env.GYM_SERVICE_URL || 'http://localhost:3002';
        this.USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
        
        // API gateway URL
        this.apiGatewayUrl = process.env.API_GATEWAY_URL || 'http://localhost:3000';
    }

    /**
     * Send subscription confirmation email using metadata
     * @param {string} customerEmail - Customer email from Stripe
     * @param {string} userId - User ID to fetch user details
     * @param {string} planId - Plan ID to fetch plan details
     * @param {string} subscriptionId - Stripe subscription ID
     */
    async sendSubscriptionConfirmationEmailWithMetadata(customerEmail, userId, planId, subscriptionId) {
        try {
            console.log('Fetching user and plan details for subscription email');
            
            // Fetch user details
            const userResponse = await fetch(`${this.USER_SERVICE_URL}/user/${userId}`);
            if (!userResponse.ok) {
                throw new Error(`Failed to fetch user details: ${userResponse.statusText}`);
            }
            const userData = await userResponse.json();
            const userName = userData.fullName || userData.name || 'Valued Member';
            
            // Fetch plan details
            const planResponse = await fetch(`${this.GYM_SERVICE_URL}/getgymplan/${planId}`);
            if (!planResponse.ok) {
                throw new Error(`Failed to fetch plan details: ${planResponse.statusText}`);
            }
            const planData = await planResponse.json();
            
            // Send email with fetched details
            await this.sendSubscriptionConfirmationEmail(
                customerEmail,
                userName,
                planData.gym.name,
                planData.name,
                `$${planData.price}`,
                planData.duration,
                subscriptionId
            );
            
        } catch (error) {
            console.error('Error in sendSubscriptionConfirmationEmailWithMetadata:', error);
            throw error;
        }
    }

    /**
     * Send subscription confirmation email to user
     * @param {string} userEmail - User's email
     * @param {string} userName - User's name
     * @param {string} gymName - Name of the gym
     * @param {string} planName - Name of the subscribed plan
     * @param {string} planPrice - Price of the plan
     * @param {string} planDuration - Duration of the plan
     * @param {string} subscriptionId - Stripe subscription ID
     */
    async sendSubscriptionConfirmationEmail(userEmail, userName, gymName, planName, planPrice, planDuration, subscriptionId) {
        try {
            console.log('Sending subscription confirmation email to user:', userEmail);

            const msg = {
                to: userEmail,
                from: this.fromEmail,
                subject: `🎉 Subscription Confirmed - Welcome to ${gymName}!`,
                html: this.getSubscriptionConfirmationTemplate(userName, gymName, planName, planPrice, planDuration, subscriptionId),
                text: this.getSubscriptionConfirmationText(userName, gymName, planName, planPrice, planDuration, subscriptionId)
            };

            const response = await sgMail.send(msg);
            console.log('Subscription confirmation email sent successfully:', response[0].statusCode);
            return { success: true, messageId: response[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Error sending subscription confirmation email:', error);
            if (error.response && error.response.body && error.response.body.errors) {
                console.error('SendGrid detailed error:', JSON.stringify(error.response.body.errors, null, 2));
            }
            throw new Error(`Failed to send subscription confirmation email: ${error.message}`);
        }
    }

    /**
     * Get gym plan details by plan ID
     */
    async getGymPlanDetails(planId) {
        try {
            console.log('Fetching gym plan details for planId:', planId);
            
            const response = await axios.post(`${this.apiGatewayUrl}/api/gym/getgymplandetails`, {
                planIds: {
                    planIds: [planId]
                }
            });

            console.log('Gym plan details response:', response.data);

            if (response.data && response.data.planDetails && response.data.planDetails.length > 0) {
                const planDetail = response.data.planDetails[0];
                return {
                    planName: planDetail.title,
                    planPrice: planDetail.price,
                    planDuration: planDetail.duration,
                    gymName: planDetail.gym?.gym_name || 'Your Gym'
                };
            }

            console.log('Plan details not found');
            return null;
        } catch (error) {
            console.error('Error fetching gym plan details:', error);
            return null;
        }
    }

    /**
     * Get customer details by customer ID
     */
    async getCustomerDetails(customerId) {
        try {
            console.log('Fetching customer details for customerId:', customerId);
            
            const response = await axios.get(`${this.apiGatewayUrl}/api/user/getuserbyid/${customerId}`);

            console.log('Customer details response:', response.data);

            if (response.data && response.data.customer) {
                return {
                    userName: response.data.customer.customer_name || response.data.customer.first_name || 'Valued Customer',
                    userEmail: response.data.customer.email
                };
            }

            console.log('Customer details not found');
            return null;
        } catch (error) {
            console.error('Error fetching customer details:', error);
            return null;
        }
    }

    /**
     * HTML template for subscription confirmation email
     */
    getSubscriptionConfirmationTemplate(userName, gymName, planName, planPrice, planDuration, subscriptionId) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Subscription Confirmed - FitNest</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-icon { font-size: 48px; margin-bottom: 20px; }
                .subscription-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50; }
                .cta-button { display: inline-block; background: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .highlight { background: #e8f5e8; padding: 10px; border-radius: 5px; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="success-icon">🎉</div>
                <h1>Subscription Confirmed!</h1>
                <p>Welcome to your fitness journey</p>
            </div>
            <div class="content">
                <h2>Hello ${userName}!</h2>
                <p>Congratulations! Your subscription to <strong>${gymName}</strong> has been successfully confirmed. You're now ready to start your fitness journey!</p>
                
                <div class="subscription-details">
                    <h3>📋 Your Subscription Details:</h3>
                    <ul>
                        <li><strong>Gym:</strong> ${gymName}</li>
                        <li><strong>Plan:</strong> ${planName}</li>
                        <li><strong>Price:</strong> $${planPrice}</li>
                        <li><strong>Duration:</strong> ${planDuration}</li>
                        <li><strong>Subscription ID:</strong> ${subscriptionId}</li>
                    </ul>
                </div>

                <div class="highlight">
                    <h3>🚀 What's Next:</h3>
                    <ul>
                        <li>💪 Access all gym facilities and equipment</li>
                        <li>👨‍💼 Connect with professional trainers</li>
                        <li>📅 Book training sessions and classes</li>
                        <li>📊 Track your fitness progress</li>
                        <li>🏆 Achieve your fitness goals</li>
                    </ul>
                </div>

                <p><strong>Getting Started:</strong></p>
                <ul>
                    <li>📱 Log in to your FitNest dashboard</li>
                    <li>🗓️ Check available training sessions</li>
                    <li>📍 Visit ${gymName} and show your subscription</li>
                    <li>🎯 Set your fitness goals and start working out!</li>
                </ul>

                <a href="${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard/user" class="cta-button">
                    Go to Dashboard
                </a>

                <p>Thank you for choosing FitNest for your fitness journey. We're excited to see you achieve your goals!</p>
                
                <p>Stay strong and keep moving,<br>
                The FitNest Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message. Please do not reply to this email.</p>
                <p>If you have questions, contact us at support@fitnest.com</p>
                <p>Need help? Visit our support center or contact ${gymName} directly.</p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Plain text version for subscription confirmation email
     */
    getSubscriptionConfirmationText(userName, gymName, planName, planPrice, planDuration, subscriptionId) {
        return `
🎉 Subscription Confirmed!

Hello ${userName}!

Congratulations! Your subscription to ${gymName} has been successfully confirmed. You're now ready to start your fitness journey!

📋 Your Subscription Details:
• Gym: ${gymName}
• Plan: ${planName}
• Price: $${planPrice}
• Duration: ${planDuration}
• Subscription ID: ${subscriptionId}

🚀 What's Next:
💪 Access all gym facilities and equipment
👨‍💼 Connect with professional trainers
📅 Book training sessions and classes
📊 Track your fitness progress
🏆 Achieve your fitness goals

Getting Started:
📱 Log in to your FitNest dashboard
🗓️ Check available training sessions
📍 Visit ${gymName} and show your subscription
🎯 Set your fitness goals and start working out!

Dashboard: ${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard/user

Thank you for choosing FitNest for your fitness journey. We're excited to see you achieve your goals!

Stay strong and keep moving,
The FitNest Team

---
This is an automated message. Please do not reply to this email.
If you have questions, contact us at support@fitnest.com
Need help? Visit our support center or contact ${gymName} directly.
        `;
    }
}

export default SubscriptionEmailService;