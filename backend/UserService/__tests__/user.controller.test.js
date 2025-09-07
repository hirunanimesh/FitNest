import {
	updateuserdetails,
	getuserbyid,
	addweight,
	getweightbyid,
	getlatestweightbyid,
	addfeedback
} from '../controllers/user.controller.js';

import {
	updateUserDetails,
	getUserById,
	addWeight,
	getWeightById,
	getLatestWeightById
} from '../services/user.service.js';

import { addFeedback } from '../services/feedback.service.js';

jest.mock('../services/user.service.js');
jest.mock('../services/feedback.service.js');

describe('User Controller Unit Tests', () => {
	let req, res;

	beforeEach(() => {
		jest.clearAllMocks();

		req = { params: {}, body: {} };

		res = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn().mockReturnThis()
		};
	});

	describe('updateuserdetails', () => {
		test('should return 200 and updated user when service returns user', async () => {
			const userId = '123';
			const updated = { id: userId, name: 'Alice' };
			req.params.userId = userId;
			req.body = { name: 'Alice' };

			updateUserDetails.mockResolvedValue(updated);

			await updateuserdetails(req, res);

			expect(updateUserDetails).toHaveBeenCalledWith(userId, req.body);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'User updated successfully', updatedUser: updated });
		});

		test('should return 404 when no user is returned', async () => {
			req.params.userId = 'not-found';
			updateUserDetails.mockResolvedValue(null);

			await updateuserdetails(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
		});

		test('should return 500 on service error', async () => {
			req.params.userId = 'err';
			updateUserDetails.mockRejectedValue(new Error('DB fail'));

			await updateuserdetails(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('getuserbyid', () => {
		test('should return 200 and user when found', async () => {
			const userId = 'u1';
			const user = { id: userId, email: 'a@b.com' };
			req.params.userId = userId;
			getUserById.mockResolvedValue(user);

			await getuserbyid(req, res);

			expect(getUserById).toHaveBeenCalledWith(userId);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'User retrieved successfully', user });
		});

		test('should return 404 when user not found', async () => {
			req.params.userId = 'missing';
			getUserById.mockResolvedValue(null);

			await getuserbyid(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
		});

		test('should return 500 on service error', async () => {
			req.params.userId = 'err';
			getUserById.mockRejectedValue(new Error('boom'));

			await getuserbyid(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('addweight', () => {
		test('should return 200 and weight on success', async () => {
			const weight = { id: 'w1', weight: 70 };
			req.body = { customer_id: 'u1', weight: 70 };
			addWeight.mockResolvedValue(weight);

			await addweight(req, res);

			expect(addWeight).toHaveBeenCalledWith(req.body);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'Weight add successfully', weight });
		});

		test('should return 500 on service error', async () => {
			req.body = { }; 
			addWeight.mockRejectedValue(new Error('insert fail'));

			await addweight(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('getweightbyid', () => {
		test('should return 200 and weight list when found', async () => {
			const userId = 'u1';
			const weights = [{ weight: 70 }, { weight: 71 }];
			req.params.userId = userId;
			getWeightById.mockResolvedValue(weights);

			await getweightbyid(req, res);

			expect(getWeightById).toHaveBeenCalledWith(userId);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'Weight retrieved successfully', weight: weights });
		});

		test('should return 404 when no weights found', async () => {
			req.params.userId = 'none';
			getWeightById.mockResolvedValue(null);

			await getweightbyid(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: 'Weight plan not found' });
		});

		test('should return 500 on service error', async () => {
			req.params.userId = 'err';
			getWeightById.mockRejectedValue(new Error('fail'));

			await getweightbyid(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('getlatestweightbyid', () => {
		test('should return 200 and latest weight when found', async () => {
			const userId = 'u1';
			const latest = { height: 170, weight: 70 };
			req.params.userId = userId;
			getLatestWeightById.mockResolvedValue(latest);

			await getlatestweightbyid(req, res);

			expect(getLatestWeightById).toHaveBeenCalledWith(userId);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'Weight retrieved successfully', weight: latest });
		});

		test('should return 404 when latest weight not found', async () => {
			req.params.userId = 'none';
			getLatestWeightById.mockResolvedValue(null);

			await getlatestweightbyid(req, res);

			expect(res.status).toHaveBeenCalledWith(404);
			expect(res.json).toHaveBeenCalledWith({ message: 'Weight  not found' });
		});

		test('should return 500 on service error', async () => {
			req.params.userId = 'err';
			getLatestWeightById.mockRejectedValue(new Error('fail'));

			await getlatestweightbyid(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});

	describe('addfeedback', () => {
		test('should return 200 and feedback on success', async () => {
			const feedback = { id: 'f1', comment: 'Good' };
			req.body = { customer_id: 'u1', comment: 'Good' };
			addFeedback.mockResolvedValue(feedback);

			await addfeedback(req, res);

			expect(addFeedback).toHaveBeenCalledWith(req.body);
			expect(res.status).toHaveBeenCalledWith(200);
			expect(res.json).toHaveBeenCalledWith({ message: 'feedback add successfully', feedback });
		});

		test('should return 500 on feedback service error', async () => {
			req.body = {};
			addFeedback.mockRejectedValue(new Error('fail'));

			await addfeedback(req, res);

			expect(res.status).toHaveBeenCalledWith(500);
			expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Internal server error' }));
		});
	});
});
