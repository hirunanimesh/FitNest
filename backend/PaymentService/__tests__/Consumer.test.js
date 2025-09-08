import { GymPlanCreatedConsumer, GymPlanDeletedConsumer, GymPlanPriceUpdatedConsumer } from '../kafka/Consumer.js';

// Mock kafka
jest.mock('../config/Kafka.js', () => ({
  kafka: {
    consumer: jest.fn(),
  },
}));

// Mock controllers
jest.mock('../controllers/stripeController/create-plan.js', () => jest.fn());

jest.mock('../controllers/mongoController/add-plan-data.js', () => ({
  deletePlanData: jest.fn(),
}));

jest.mock('../controllers/stripeController/update-gymplan-price.js', () => jest.fn());

import { kafka } from '../config/Kafka.js';
import createPlan from '../controllers/stripeController/create-plan.js';
import { deletePlanData } from '../controllers/mongoController/add-plan-data.js';
import updateGymPlanPrice from '../controllers/stripeController/update-gymplan-price.js';

describe('Kafka Consumers', () => {
  let mockConsumer;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConsumer = {
      connect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
    };
    kafka.consumer.mockReturnValue(mockConsumer);
  });

  describe('GymPlanCreatedConsumer', () => {
    it('should set up consumer for gym_plan_created topic', async () => {
      mockConsumer.connect.mockResolvedValue();
      mockConsumer.subscribe.mockResolvedValue();
      mockConsumer.run.mockResolvedValue();

      await GymPlanCreatedConsumer();

      expect(kafka.consumer).toHaveBeenCalledWith({ groupId: 'payment-service-created' });
      expect(mockConsumer.connect).toHaveBeenCalled();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topic: 'gym_plan_created',
        fromBeginning: true,
      });
      expect(mockConsumer.run).toHaveBeenCalled();
    });

    it('should process gym plan created message correctly', async () => {
      const mockMessage = {
        value: Buffer.from(JSON.stringify({
          planId: 'plan_123',
          title: 'Test Plan',
          price: 10,
          duration: '1 month',
        })),
      };

      createPlan.mockResolvedValue();

      // Set up the consumer with a callback
      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessage({ message: mockMessage });
      });

      await GymPlanCreatedConsumer();

      expect(createPlan).toHaveBeenCalledWith('Test Plan', 10, '1 month', 'plan_123');
    });

    it('should handle errors in message processing', async () => {
      const mockMessage = {
        value: Buffer.from('invalid json'),
      };

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessage({ message: mockMessage });
      });

      await GymPlanCreatedConsumer();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to process message:',
        expect.any(SyntaxError)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('GymPlanDeletedConsumer', () => {
    it('should set up consumer for gym_plan_deleted topic', async () => {
      mockConsumer.connect.mockResolvedValue();
      mockConsumer.subscribe.mockResolvedValue();
      mockConsumer.run.mockResolvedValue();

      await GymPlanDeletedConsumer();

      expect(kafka.consumer).toHaveBeenCalledWith({ groupId: 'payment-service-deleted' });
      expect(mockConsumer.connect).toHaveBeenCalled();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topic: 'gym_plan_deleted',
        fromBeginning: true,
      });
      expect(mockConsumer.run).toHaveBeenCalled();
    });

    it('should process gym plan deleted message correctly', async () => {
      const mockMessage = {
        value: Buffer.from(JSON.stringify({
          planId: 'plan_123',
        })),
      };

      deletePlanData.mockResolvedValue();

      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessage({ message: mockMessage });
      });

      await GymPlanDeletedConsumer();

      expect(deletePlanData).toHaveBeenCalledWith('plan_123');
    });
  });

  describe('GymPlanPriceUpdatedConsumer', () => {
    it('should set up consumer for gym_plan_updated topic', async () => {
      mockConsumer.connect.mockResolvedValue();
      mockConsumer.subscribe.mockResolvedValue();
      mockConsumer.run.mockResolvedValue();

      await GymPlanPriceUpdatedConsumer();

      expect(kafka.consumer).toHaveBeenCalledWith({ groupId: 'payment-service-price-updated' });
      expect(mockConsumer.connect).toHaveBeenCalled();
      expect(mockConsumer.subscribe).toHaveBeenCalledWith({
        topic: 'gym_plan_updated',
        fromBeginning: true,
      });
      expect(mockConsumer.run).toHaveBeenCalled();
    });

    it('should process gym plan price updated message correctly', async () => {
      const mockMessage = {
        value: Buffer.from(JSON.stringify({
          planId: 'plan_123',
          price: 15,
          duration: '1 year',
        })),
      };

      updateGymPlanPrice.mockResolvedValue();

      mockConsumer.run.mockImplementation(({ eachMessage }) => {
        eachMessage({ message: mockMessage });
      });

      await GymPlanPriceUpdatedConsumer();

      expect(updateGymPlanPrice).toHaveBeenCalledWith('plan_123', 15, '1 year');
    });
  });
});