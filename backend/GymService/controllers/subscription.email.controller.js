import GymPlanEmailService from "../services/GymPlanEmailService.js";

export const sendSubscriptionEmail = async (req, res) => {
    const { userEmail, userName, planName, planPrice, planDuration, gymName, planDescription } = req.body;

    try {
        const emailService = new GymPlanEmailService();
        await emailService.sendSubscriptionConfirmationEmail(
            userEmail,
            userName,
            planName,
            planPrice,
            planDuration,
            gymName,
            planDescription
        );
        res.status(200).json({ message: "Subscription confirmation email sent successfully." });
    } catch (error) {
        console.error("Error sending subscription email:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
