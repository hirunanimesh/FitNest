const db = require('../models'); // Adjust path as needed
const Feedback = db.Feedback;

class FeedbackService {
    // Create feedback for trainer or gym
    async createFeedback({ userId, targetId, targetType, comment, rating }) {
        // targetType: 'trainer' or 'gym'
        if (!['trainer', 'gym'].includes(targetType)) {
            throw new Error('Invalid target type');
        }
        return await Feedback.create({
            userId,
            targetId,
            targetType,
            comment,
            rating
        });
    }

    // Get feedback for a trainer or gym
    async getFeedbacks(targetId, targetType) {
        return await Feedback.findAll({
            where: { targetId, targetType },
            include: [{ model: db.User, attributes: ['id', 'name'] }]
        });
    }

    // Optionally: get feedbacks by user
    async getUserFeedbacks(userId) {
        return await Feedback.findAll({
            where: { userId }
        });
    }
}

module.exports