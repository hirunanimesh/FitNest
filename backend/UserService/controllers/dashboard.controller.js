import dashboardService from '../services/dashboard.service.js';

class DashboardController {
  
  /**
   * Get complete dashboard data
   * GET /api/dashboard
   */
  async getDashboard(req, res) {
    try {
      const userId = req.user?.id; // Assuming user ID is available from auth middleware
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      const result = await dashboardService.getDashboardData(userId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Dashboard controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  /**
   * Get motivation phase data only
   * GET /api/dashboard/motivation
   */
  async getMotivation(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      const motivationData = await dashboardService.getMotivationPhase(userId);
      
      res.status(200).json({
        success: true,
        data: motivationData
      });
    } catch (error) {
      console.error('Motivation controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch motivation data'
      });
    }
  }

  /**
   * Get subscribed plans data
   * GET /api/dashboard/plans
   */
  async getSubscribedPlans(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      const plansData = await dashboardService.getSubscribedPlans(userId);
      
      res.status(200).json({
        success: true,
        data: plansData
      });
    } catch (error) {
      console.error('Plans controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch subscribed plans'
      });
    }
  }

  /**
   * Get BMI variation data
   * GET /api/dashboard/bmi-variation
   */
  async getBMIVariation(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      const bmiData = await dashboardService.getBMIVariation(userId);
      
      res.status(200).json({
        success: true,
        data: bmiData
      });
    } catch (error) {
      console.error('BMI variation controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch BMI variation data'
      });
    }
  }

  /**
   * Get calendar tasks
   * GET /api/dashboard/calendar
   */
  async getCalendarTasks(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      const calendarData = await dashboardService.getCalendarTasks(userId);
      
      res.status(200).json({
        success: true,
        data: calendarData
      });
    } catch (error) {
      console.error('Calendar controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch calendar tasks'
      });
    }
  }

  /**
   * Add weight entry manually
   * POST /api/dashboard/weight-entry
   * Body: { weight: number, height: number, date?: string }
   */
  async addWeightEntry(req, res) {
    try {
      const userId = req.user?.id;
      const { weight, height, date } = req.body;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      // Validate required fields
      if (!weight || !height) {
        return res.status(400).json({
          success: false,
          error: 'Weight and height are required'
        });
      }

      // Validate weight and height values
      if (weight <= 0 || weight > 1000) {
        return res.status(400).json({
          success: false,
          error: 'Invalid weight value'
        });
      }

      if (height <= 0 || height > 300) {
        return res.status(400).json({
          success: false,
          error: 'Invalid height value'
        });
      }

      // Validate date format if provided
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid date format. Use YYYY-MM-DD'
        });
      }

      const result = await dashboardService.addWeightEntry(userId, weight, height, date);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Add weight entry controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add weight entry'
      });
    }
  }

  /**
   * Get dashboard statistics summary
   * GET /api/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized - User ID not found'
        });
      }

      // Get basic stats without full data
      const [motivationData, weightProgress, bmiData, calendarData] = await Promise.all([
        dashboardService.getMotivationPhase(userId),
        dashboardService.getBMIVariation(userId),
        dashboardService.getCalendarTasks(userId)
      ]);

      const stats = {
        workoutStreak: motivationData.workoutStreak,
        totalWorkouts: motivationData.totalWorkouts,
        weeklyProgress: motivationData.weeklyProgress,
        currentBMI: bmiData.stats.currentBMI,
        bmiCategory: bmiData.stats.currentCategory,
        todaysTasksCount: calendarData.todaysTasks.length,
        upcomingTasksCount: calendarData.upcomingTasksCount
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Dashboard stats controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard statistics'
      });
    }
  }
}

export default new DashboardController();
