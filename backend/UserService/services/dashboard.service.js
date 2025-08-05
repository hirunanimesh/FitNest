import { supabase } from '../database/supabase.js';
import CalendarService from './calendar.service.js';

class DashboardService {
  // Get motivation phase based on user's progress and goals
  async getMotivationPhase(customerId) {
    try {
      const { data: latestProgress, error: progressError } = await supabase
        .from('progress')
        .select('*')
        .eq('customer_id', customerId)
        .order('logged_date', { ascending: false })
        .limit(1);

      if (progressError) throw progressError;

      let motivationPhase = 'Getting Started';
      let motivationMessage = 'Welcome to your fitness journey!';
      let progressPercentage = 0;

      if (latestProgress && latestProgress.length > 0) {
        const { data: recentProgress } = await supabase
          .from('progress')
          .select('weight, logged_date')
          .eq('customer_id', customerId)
          .gte('logged_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
          .order('logged_date', { ascending: false });

        if (recentProgress && recentProgress.length >= 2) {
          const weightDifference = recentProgress[0].weight - recentProgress[recentProgress.length - 1].weight;
          const daysTracking = recentProgress.length;

          if (daysTracking >= 7) {
            motivationPhase = 'Building Momentum';
            progressPercentage = 25;
            motivationMessage = `Great job! You've been tracking for ${daysTracking} days.`;
          }

          if (daysTracking >= 21) {
            motivationPhase = 'Habit Forming';
            progressPercentage = 50;
            motivationMessage = 'You are building healthy habits!';
          }

          if (daysTracking >= 60) {
            motivationPhase = 'Transformation Mode';
            progressPercentage = 75;
            motivationMessage = 'Your consistency is paying off!';
          }

          if (daysTracking >= 90 && Math.abs(weightDifference) > 2) {
            motivationPhase = 'Goal Crusher';
            progressPercentage = 90;
            motivationMessage = 'Amazing transformation!';
          }
        }
      }

      return {
        phase: motivationPhase,
        message: motivationMessage,
        progressPercentage
      };
    } catch (error) {
      console.error('Error fetching motivation phase:', error);
      throw new Error('Failed to fetch motivation data');
    }
  }

  // Get subscribed gym plans and personal training plans
  async getSubscribedPlans(customerId) {
    try {
      const { data: gymPlans, error: gymError } = await supabase
        .from('gym_subscriptions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'active');

      if (gymError) throw gymError;

      const { data: personalPlans, error: personalError } = await supabase
        .from('personal_training_subscriptions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('status', 'active');

      if (personalError) throw personalError;

      return {
        gymPlans: gymPlans || [],
        personalTrainingPlans: personalPlans || []
      };
    } catch (error) {
      console.error('Error fetching subscribed plans:', error);
      throw new Error('Failed to fetch subscribed plans');
    }
  }

  // Get weight variation data for graph
  async getWeightVariation(customerId, days = 90) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: weightData, error } = await supabase
        .from('progress')
        .select('weight, logged_date')
        .eq('customer_id', customerId)
        .gte('logged_date', startDate.toISOString().split('T')[0])
        .order('logged_date', { ascending: true });

      if (error) throw error;

      return weightData.map(record => ({
        date: record.logged_date,
        weight: parseFloat(record.weight)
      }));
    } catch (error) {
      console.error('Error fetching weight variation:', error);
      throw new Error('Failed to fetch weight variation data');
    }
  }

  // Get BMI variation data for graph
  async getBMIVariation(customerId, days = 90) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: progressData, error } = await supabase
        .from('progress')
        .select('weight, height, logged_date')
        .eq('customer_id', customerId)
        .gte('logged_date', startDate.toISOString().split('T')[0])
        .order('logged_date', { ascending: true });

      if (error) throw error;

      return progressData.map(record => {
        const heightInMeters = parseFloat(record.height) / 100;
        const bmi = parseFloat(record.weight) / (heightInMeters * heightInMeters);
        return {
          date: record.logged_date,
          bmi: parseFloat(bmi.toFixed(1))
        };
      });
    } catch (error) {
      console.error('Error fetching BMI variation:', error);
      throw new Error('Failed to fetch BMI variation data');
    }
  }

  // Get calendar tasks
  async getCalendarTasks(customerId) {
    try {
      return await CalendarService.getLocalCalendarTasks(customerId);
    } catch (error) {
      console.error('Error fetching calendar tasks:', error);
      throw new Error('Failed to fetch calendar tasks');
    }
  }

  // Get complete dashboard data
  async getDashboardData(customerId) {
    try {
      const [motivation, plans, weightData, bmiData, calendar] = await Promise.all([
        this.getMotivationPhase(customerId),
        this.getSubscribedPlans(customerId),
        this.getWeightVariation(customerId),
        this.getBMIVariation(customerId),
        this.getCalendarTasks(customerId)
      ]);

      return {
        motivation,
        plans,
        weightData,
        bmiData,
        calendar
      };
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      throw new Error('Failed to fetch dashboard data');
    }
  }
}

export default new DashboardService();