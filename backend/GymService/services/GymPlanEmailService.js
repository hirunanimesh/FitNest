import sgMail from '@sendgrid/mail';
import { supabase } from '../database/supabase.js';

class GymPlanEmailService {
    constructor() {
        // Set the SendGrid API key from environment variables
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        
        // Default sender email
        this.fromEmail = process.env.FROM_EMAIL || 'noreply@fitnest.com';
    }

    /**
     * Send plan creation confirmation email to gym owner
     * @param {string} ownerEmail - Gym owner's email
     * @param {string} ownerName - Gym owner's name
     * @param {string} gymName - Name of the gym
     * @param {string} planName - Name of the created plan
     * @param {string} planPrice - Price of the plan
     * @param {string} planDuration - Duration of the plan
     */
    async sendPlanCreationEmail(ownerEmail, ownerName, gymName, planName, planPrice, planDuration) {
        try {
            console.log('Sending plan creation email to gym owner:', ownerEmail);

            const msg = {
                to: ownerEmail,
                from: this.fromEmail,
                subject: `🎉 New Gym Plan Created Successfully - ${planName}`,
                html: this.getPlanCreationTemplate(ownerName, gymName, planName, planPrice, planDuration),
                text: this.getPlanCreationText(ownerName, gymName, planName, planPrice, planDuration)
            };

            const response = await sgMail.send(msg);
            console.log('Plan creation email sent successfully:', response[0].statusCode);
            return { success: true, messageId: response[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Error sending plan creation email:', error);
            if (error.response && error.response.body && error.response.body.errors) {
                console.error('SendGrid detailed error:', JSON.stringify(error.response.body.errors, null, 2));
            }
            throw new Error(`Failed to send plan creation email: ${error.message}`);
        }
    }

    /**
     * Send trainer assignment notification email
     * @param {string} trainerEmail - Trainer's email
     * @param {string} trainerName - Trainer's name
     * @param {string} gymName - Name of the gym
     * @param {string} planName - Name of the plan
     * @param {string} planPrice - Price of the plan
     * @param {string} planDuration - Duration of the plan
     */
    async sendTrainerAssignmentEmail(trainerEmail, trainerName, gymName, planName, planPrice, planDuration) {
        try {
            console.log('Sending trainer assignment email to:', trainerEmail);

            const msg = {
                to: trainerEmail,
                from: this.fromEmail,
                subject: `🏋️ You've Been Assigned to a New Gym Plan - ${gymName}`,
                html: this.getTrainerAssignmentTemplate(trainerName, gymName, planName, planPrice, planDuration),
                text: this.getTrainerAssignmentText(trainerName, gymName, planName, planPrice, planDuration)
            };

            const response = await sgMail.send(msg);
            console.log('Trainer assignment email sent successfully:', response[0].statusCode);
            return { success: true, messageId: response[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Error sending trainer assignment email:', error);
            if (error.response && error.response.body && error.response.body.errors) {
                console.error('SendGrid detailed error:', JSON.stringify(error.response.body.errors, null, 2));
            }
            throw new Error(`Failed to send trainer assignment email: ${error.message}`);
        }
    }

    /**
     * Get gym owner details by gym_id
     */
    async getGymOwnerDetails(gymId) {
        try {
            console.log('Fetching gym owner details for gymId:', gymId);
            
            const { data, error } = await supabase.rpc('get_gym_owner_details', { 
                gym_id: gymId 
            });

            console.log('Gym owner details fetched:', data);

            if (error) {
                console.error('Error fetching gym owner details:', error);
                return null;
            }

            if (!data || data.length === 0) {
                console.log('Gym details not found for email notification');
                return null;
            }

            // Handle both single object and array responses
            const gymData = Array.isArray(data) ? data[0] : data;

            return {
                ownerEmail: gymData.owner_email,
                ownerName: gymData.owner_name,
                gymName: gymData.gym_name
            };
        } catch (error) {
            console.error('Error in getGymOwnerDetails:', error);
            return null;
        }
    }

    /**
     * Get trainer details by trainer IDs
     */
    async getTrainerDetails(trainerIds) {
        try {
            console.log('Fetching trainer details for IDs:', trainerIds);
            
            const { data, error } = await supabase.rpc('get_trainer_details', {
                trainer_ids: trainerIds
            });

            console.log('Trainer details fetched:', data);

            if (error) {
                console.error('Error fetching trainer details:', error);
                return [];
            }

            if (!data || data.length === 0) {
                console.log('No trainer details found');
                return [];
            }

            // Handle the RPC response structure
            const trainersWithEmails = data.map(trainer => ({
                trainerId: trainer.trainer_id,
                trainerName: trainer.trainer_name,
                trainerEmail: trainer.trainer_email
            })).filter(trainer => trainer.trainerEmail); // Only return trainers with valid emails

            console.log('Processed trainer details:', trainersWithEmails);
            return trainersWithEmails;
        } catch (error) {
            console.error('Error in getTrainerDetails:', error);
            return [];
        }
    }

    /**
     * HTML template for plan creation email
     */
    getPlanCreationTemplate(ownerName, gymName, planName, planPrice, planDuration) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Plan Created Successfully - FitNest</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .success-icon { font-size: 48px; margin-bottom: 20px; }
                .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
                .cta-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="success-icon">🎉</div>
                <h1>Plan Created Successfully!</h1>
                <p>Your new gym plan is now active</p>
            </div>
            <div class="content">
                <h2>Hello ${ownerName}!</h2>
                <p>Great news! You have successfully created a new gym plan for <strong>${gymName}</strong>.</p>
                
                <div class="plan-details">
                    <h3>📋 Plan Details:</h3>
                    <ul>
                        <li><strong>Plan Name:</strong> ${planName}</li>
                        <li><strong>Price:</strong> ${planPrice}</li>
                        <li><strong>Duration:</strong> ${planDuration}</li>
                        <li><strong>Gym:</strong> ${gymName}</li>
                    </ul>
                </div>

                <p><strong>What's next:</strong></p>
                <ul>
                    <li>🎯 Your plan is now available for members to subscribe</li>
                    <li>👥 You can assign trainers to this plan anytime</li>
                    <li>📊 Track your plan's performance in the dashboard</li>
                    <li>📈 Monitor member subscriptions and revenue</li>
                </ul>

                <a href="${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard/gym/plans" class="cta-button">
                    Manage Your Plans
                </a>

                <p>Thank you for using FitNest to grow your fitness business!</p>
                
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
     * Plain text version for plan creation email
     */
    getPlanCreationText(ownerName, gymName, planName, planPrice, planDuration) {
        return `
🎉 Plan Created Successfully!

Hello ${ownerName}!

Great news! You have successfully created a new gym plan for ${gymName}.

📋 Plan Details:
• Plan Name: ${planName}
• Price: ${planPrice}
• Duration: ${planDuration}
• Gym: ${gymName}

What's next:
🎯 Your plan is now available for members to subscribe
👥 You can assign trainers to this plan anytime
📊 Track your plan's performance in the dashboard
📈 Monitor member subscriptions and revenue

Manage Your Plans: ${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard/gym/plans

Thank you for using FitNest to grow your fitness business!

Best regards,
The FitNest Team

---
This is an automated message. Please do not reply to this email.
If you have questions, contact us at support@fitnest.com
        `;
    }

    /**
     * HTML template for trainer assignment email
     */
    getTrainerAssignmentTemplate(trainerName, gymName, planName, planPrice, planDuration) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Plan Assignment - FitNest</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .assignment-icon { font-size: 48px; margin-bottom: 20px; }
                .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
                .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="assignment-icon">🏋️</div>
                <h1>New Plan Assignment!</h1>
                <p>You've been assigned to a gym plan</p>
            </div>
            <div class="content">
                <h2>Hello ${trainerName}!</h2>
                <p>You have been assigned to a new gym plan at <strong>${gymName}</strong>. We're excited to have you as part of this fitness journey!</p>
                
                <div class="plan-details">
                    <h3>📋 Plan Assignment Details:</h3>
                    <ul>
                        <li><strong>Gym:</strong> ${gymName}</li>
                        <li><strong>Plan Name:</strong> ${planName}</li>
                        <li><strong>Plan Price:</strong> ${planPrice}</li>
                        <li><strong>Plan Duration:</strong> ${planDuration}</li>
                    </ul>
                </div>

                <p><strong>Your responsibilities:</strong></p>
                <ul>
                    <li>💪 Provide professional training services to plan members</li>
                    <li>📅 Maintain your availability schedule</li>
                    <li>🎯 Help members achieve their fitness goals</li>
                    <li>📈 Contribute to the success of this plan</li>
                </ul>

                <p><strong>Next steps:</strong></p>
                <ul>
                    <li>📱 Log in to your trainer dashboard</li>
                    <li>📋 Review the plan details and requirements</li>
                    <li>⏰ Update your availability for this plan</li>
                    <li>👥 Get ready to work with new members!</li>
                </ul>

                <a href="${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard/trainer" class="cta-button">
                    Go to Trainer Dashboard
                </a>

                <p>Thank you for being part of the FitNest community. Let's help people achieve their fitness goals together!</p>
                
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
     * Plain text version for trainer assignment email
     */
    getTrainerAssignmentText(trainerName, gymName, planName, planPrice, planDuration) {
        return `
🏋️ New Plan Assignment!

Hello ${trainerName}!

You have been assigned to a new gym plan at ${gymName}. We're excited to have you as part of this fitness journey!

📋 Plan Assignment Details:
• Gym: ${gymName}
• Plan Name: ${planName}
• Plan Price: ${planPrice}
• Plan Duration: ${planDuration}

Your responsibilities:
💪 Provide professional training services to plan members
📅 Maintain your availability schedule
🎯 Help members achieve their fitness goals
📈 Contribute to the success of this plan

Next steps:
📱 Log in to your trainer dashboard
📋 Review the plan details and requirements
⏰ Update your availability for this plan
👥 Get ready to work with new members!

Trainer Dashboard: ${process.env.FRONTEND_URL || 'https://fitnest.com'}/dashboard/trainer

Thank you for being part of the FitNest community. Let's help people achieve their fitness goals together!

Best regards,
The FitNest Team

---
This is an automated message. Please do not reply to this email.
If you have questions, contact us at support@fitnest.com
        `;
    }

    /**
     * Send promotional email to nearby customers about new gym plan
     * @param {string} customerEmail - Customer's email
     * @param {string} customerName - Customer's name
     * @param {string} gymName - Name of the gym
     * @param {string} planName - Name of the new plan
     * @param {string} planPrice - Price of the plan
     * @param {string} planDuration - Duration of the plan
     * @param {number} distanceKm - Distance from customer to gym in km
     */
    async sendPromotionalEmail(customerEmail, customerName, gymName, planName, planPrice, planDuration, distanceKm) {
        try {
            console.log('Sending promotional email to:', customerEmail);

            const msg = {
                to: customerEmail,
                from: this.fromEmail,
                subject: `🏋️ New Gym Plan Alert - ${planName} at ${gymName} (Only ${distanceKm}km away!)`,
                html: this.getPromotionalTemplate(customerName, gymName, planName, planPrice, planDuration, distanceKm),
                text: this.getPromotionalText(customerName, gymName, planName, planPrice, planDuration, distanceKm)
            };

            const response = await sgMail.send(msg);
            console.log('Promotional email sent successfully:', response[0].statusCode);
            return { success: true, messageId: response[0].headers['x-message-id'] };
        } catch (error) {
            console.error('Error sending promotional email:', error);
            if (error.response && error.response.body && error.response.body.errors) {
                console.error('SendGrid detailed error:', JSON.stringify(error.response.body.errors, null, 2));
            }
            throw new Error(`Failed to send promotional email: ${error.message}`);
        }
    }

    /**
     * HTML template for promotional email
     */
    getPromotionalTemplate(customerName, gymName, planName, planPrice, planDuration, distanceKm) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Gym Plan Near You - FitNest</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                .promo-icon { font-size: 48px; margin-bottom: 20px; }
                .plan-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b; }
                .distance-badge { background: #2ecc71; color: white; padding: 8px 15px; border-radius: 20px; display: inline-block; margin: 10px 0; font-weight: bold; }
                .price-highlight { font-size: 24px; color: #ff6b6b; font-weight: bold; }
                .cta-button { display: inline-block; background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: bold; text-transform: uppercase; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .benefits { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .benefit-item { display: flex; align-items: center; margin: 10px 0; }
                .benefit-icon { font-size: 20px; margin-right: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="promo-icon">🎯</div>
                <h1>New Gym Plan Near You!</h1>
                <p>Don't miss out on this amazing opportunity</p>
            </div>
            
            <div class="content">
                <h2>Hi ${customerName}!</h2>
                
                <p>Great news! <strong>${gymName}</strong> just launched a new fitness plan that's perfect for you, and it's super close to your location!</p>
                
                <div class="distance-badge">📍 Only ${distanceKm}km away from you!</div>
                
                <div class="plan-details">
                    <h3>🏋️ ${planName}</h3>
                    <div class="price-highlight">${planPrice}</div>
                    <p><strong>Duration:</strong> ${planDuration}</p>
                </div>
                
                <div class="benefits">
                    <h3>Why choose this plan?</h3>
                    <div class="benefit-item">
                        <span class="benefit-icon">💪</span>
                        <span>Professional trainers and equipment</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">📍</span>
                        <span>Conveniently located near you</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">⏰</span>
                        <span>Flexible schedule options</span>
                    </div>
                    <div class="benefit-item">
                        <span class="benefit-icon">🎯</span>
                        <span>Achieve your fitness goals faster</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.FRONTEND_URL || 'https://fitnest.com'}/plans" class="cta-button">
                        View Plan Details & Subscribe
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px;">
                    <em>Limited time offer! Don't wait, start your fitness journey today.</em>
                </p>
            </div>
            
            <div class="footer">
                <p>Best regards,<br>The FitNest Team</p>
                <p>
                    <a href="${process.env.FRONTEND_URL || 'https://fitnest.com'}/unsubscribe" style="color: #666;">Unsubscribe</a> | 
                    <a href="${process.env.FRONTEND_URL || 'https://fitnest.com'}/contact" style="color: #666;">Contact Us</a>
                </p>
            </div>
        </body>
        </html>
        `;
    }

    /**
     * Plain text template for promotional email
     */
    getPromotionalText(customerName, gymName, planName, planPrice, planDuration, distanceKm) {
        return `
🎯 NEW GYM PLAN NEAR YOU!

Hi ${customerName}!

Great news! ${gymName} just launched a new fitness plan that's perfect for you, and it's super close to your location!

📍 DISTANCE: Only ${distanceKm}km away from you!

🏋️ PLAN DETAILS:
Plan Name: ${planName}
Price: ${planPrice}
Duration: ${planDuration}

Why choose this plan?
💪 Professional trainers and equipment
📍 Conveniently located near you
⏰ Flexible schedule options
🎯 Achieve your fitness goals faster

Ready to get started?
Visit: ${process.env.FRONTEND_URL || 'https://fitnest.com'}/plans

Limited time offer! Don't wait, start your fitness journey today.

Best regards,
The FitNest Team

---
This is a promotional email. You can unsubscribe at any time.
Visit: ${process.env.FRONTEND_URL || 'https://fitnest.com'}/unsubscribe
        `;
    }
}

export default GymPlanEmailService;