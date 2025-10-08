import { jest } from '@jest/globals';

let trainerController;
let trainerService;

// Mock the service module before importing the controller (ESM)
beforeAll(async () => {
    jest.resetModules();
	await jest.unstable_mockModule('../services/trainer.service.js', () => ({
		getalltrainers: jest.fn(),
		gettrainerbyid: jest.fn(),
		updatetrainerdetails: jest.fn(),
		getfeedbackbytrainerid: jest.fn(),
		getgymplanbytrainerid: jest.fn(),
		booksession: jest.fn(),
		getmembershipGyms: jest.fn(),
		holdsession: jest.fn(),
		releasesession: jest.fn(),
        requestTrainerVerification: jest.fn(),
        sendrequest: jest.fn(),
	}));

	trainerController = await import('../controllers/trainer.controller.js');
	trainerService = await import('../services/trainer.service.js');
});

describe('TrainerController Unit Tests (AuthService style)', () => {
	let mockReq, mockRes;

	beforeEach(() => {
		mockReq = { params: {}, query: {}, body: {} };
		mockRes = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis()
		};

		jest.clearAllMocks();
	});

	describe('getallTrainers', () => {
		test('should return trainers list with 200', async () => {
			mockReq.query = { page: '1', limit: '10', search: '' };
			const result = { data: [{ id: 1 }], total: 1, page: 1, limit: 10 };
			trainerService.getalltrainers.mockResolvedValue(result);

			await trainerController.getallTrainers(mockReq, mockRes);

			expect(trainerService.getalltrainers).toHaveBeenCalledWith(1, 10, '');
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ trainers: result }));
		});

		test('should handle service error with 500', async () => {
			trainerService.getalltrainers.mockRejectedValue(new Error('fail'));

			await trainerController.getallTrainers(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('getTrainerById', () => {
		test('returns trainer when found', async () => {
			mockReq.params.trainerId = 't1';
			const trainer = { id: 't1', name: 'T' };
			trainerService.gettrainerbyid.mockResolvedValue(trainer);

			await trainerController.getTrainerById(mockReq, mockRes);

			expect(trainerService.gettrainerbyid).toHaveBeenCalledWith('t1');
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Trainer retrieved successfully', trainer });
		});

		test('returns 404 when not found', async () => {
			mockReq.params.trainerId = 'missing';
			trainerService.gettrainerbyid.mockResolvedValue(null);

			await trainerController.getTrainerById(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Trainer not found' });
		});

		test('returns 500 on error', async () => {
			mockReq.params.trainerId = 'err';
			trainerService.gettrainerbyid.mockRejectedValue(new Error('db'));

			await trainerController.getTrainerById(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('updateTrainerDetails', () => {
		test('updates trainer successfully', async () => {
			mockReq.params.trainerId = 't1';
			mockReq.body = { name: 'New' };
			const updated = { id: 't1', name: 'New' };
			trainerService.updatetrainerdetails.mockResolvedValue(updated);

			await trainerController.updateTrainerDetails(mockReq, mockRes);

			expect(trainerService.updatetrainerdetails).toHaveBeenCalledWith('t1', mockReq.body);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Trainer updated successfully', updatedTrainer: updated });
		});

		test('returns 404 when trainer not found', async () => {
			mockReq.params.trainerId = '404';
			trainerService.updatetrainerdetails.mockResolvedValue(null);

			await trainerController.updateTrainerDetails(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Trainer not found' });
		});

		test('returns 500 on error', async () => {
			mockReq.params.trainerId = 'err';
			trainerService.updatetrainerdetails.mockRejectedValue(new Error('fail'));

			await trainerController.updateTrainerDetails(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('getFeedbackbyTrainerId', () => {
		test('returns feedbacks when found', async () => {
			mockReq.params.trainerId = 't1';
			const feedbacks = [{ id: 'f1', comment: 'Good' }];
			trainerService.getfeedbackbytrainerid.mockResolvedValue(feedbacks);

			await trainerController.getFeedbackbyTrainerId(mockReq, mockRes);

			expect(trainerService.getfeedbackbytrainerid).toHaveBeenCalledWith('t1');
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Feedbacks retrieved successfully', trainer: feedbacks });
		});

		test('returns 404 when not found', async () => {
			mockReq.params.trainerId = 'none';
			trainerService.getfeedbackbytrainerid.mockResolvedValue(null);

			await trainerController.getFeedbackbyTrainerId(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Feedbacks not found' });
		});

		test('returns 500 on error', async () => {
			mockReq.params.trainerId = 'err';
			trainerService.getfeedbackbytrainerid.mockRejectedValue(new Error('fail'));

			await trainerController.getFeedbackbyTrainerId(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('getGymPlanByTrainerId', () => {
		test('returns 400 for invalid trainerId param', async () => {
			mockReq.params.trainerId = 'not-a-number';

			await trainerController.getGymPlanByTrainerId(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(400);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid trainerId parameter' });
		});

		test('returns gymplans when found', async () => {
			mockReq.params.trainerId = '1';
			const plans = [{ id: 'p1' }];
			trainerService.getgymplanbytrainerid.mockResolvedValue(plans);

			await trainerController.getGymPlanByTrainerId(mockReq, mockRes);

			expect(trainerService.getgymplanbytrainerid).toHaveBeenCalledWith(1);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'GymPlans retrieved successfully', gymplans: plans });
		});

		test('returns 404 when no plans', async () => {
			mockReq.params.trainerId = '1';
			trainerService.getgymplanbytrainerid.mockResolvedValue(null);

			await trainerController.getGymPlanByTrainerId(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'No Plans found', gymplans: [] });
		});

		test('returns 500 on error', async () => {
			mockReq.params.trainerId = '1';
			trainerService.getgymplanbytrainerid.mockRejectedValue(new Error('fail'));

			await trainerController.getGymPlanByTrainerId(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('bookSession', () => {
		test('books session successfully', async () => {
			mockReq.body = { sessionId: 's1', customerId: 'c1' };
			const session = { session_id: 's1', booked: true };
			trainerService.booksession.mockResolvedValue(session);

			await trainerController.bookSession(mockReq, mockRes);

			expect(trainerService.booksession).toHaveBeenCalledWith('s1', 'c1');
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ success: true, session });
		});

		test('returns 404 when session not found', async () => {
			mockReq.body = { sessionId: 's404', customerId: 'c1' };
			trainerService.booksession.mockResolvedValue(null);

			await trainerController.bookSession(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(404);
			expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Session not found' });
		});

		test('returns 500 on error', async () => {
			mockReq.body = { sessionId: 'err', customerId: 'c1' };
			trainerService.booksession.mockRejectedValue(new Error('fail'));

			await trainerController.bookSession(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'fail' });
		});
	});

	describe('getGymById', () => {
		test('returns gyms when found', async () => {
			mockReq.params.trainerId = '1';
			const gyms = [{ id: 'g1' }];
			trainerService.getmembershipGyms.mockResolvedValue(gyms);

			await trainerController.getGymById(mockReq, mockRes);

			expect(trainerService.getmembershipGyms).toHaveBeenCalledWith('1');
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Gyms retrieved successfully', gyms });
		});

		test('returns 200 with empty when not found', async () => {
			mockReq.params.trainerId = 'none';
			trainerService.getmembershipGyms.mockResolvedValue(null);

			await trainerController.getGymById(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({ message: 'Gyms not found', gyms: [] });
		});

		test('returns 500 on error', async () => {
			mockReq.params.trainerId = 'err';
			trainerService.getmembershipGyms.mockRejectedValue(new Error('fail'));

			await trainerController.getGymById(mockReq, mockRes);

			expect(mockRes.status).toHaveBeenCalledWith(500);
			expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});
});
