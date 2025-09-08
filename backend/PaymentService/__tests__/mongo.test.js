import mongoose from 'mongoose';
import connectDatabase from '../database/mongo.js';

// Mock mongoose
jest.mock('mongoose', () => ({
  connect: jest.fn(),
}));

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('connectDatabase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to MongoDB successfully', async () => {
    // Mock successful connection
    const mockConnect = mongoose.connect;
    mockConnect.mockResolvedValueOnce();

    // Mock console.log and console.error
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Call the function
    connectDatabase();

    // Wait for the promise to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    // Assertions
    expect(mockConnect).toHaveBeenCalledWith(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    expect(consoleLogSpy).toHaveBeenCalledWith('✅ MongoDB connected');
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    // Restore mocks
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('should handle MongoDB connection error', async () => {
    // Mock connection error
    const mockError = new Error('Connection failed');
    const mockConnect = mongoose.connect;
    mockConnect.mockRejectedValueOnce(mockError);

    // Mock console.log and console.error
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    // Call the function
    connectDatabase();

    // Wait for the promise to resolve
    await new Promise(resolve => setTimeout(resolve, 0));

    // Assertions
    expect(mockConnect).toHaveBeenCalledWith(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith('❌ MongoDB connection error:', mockError);
    expect(consoleLogSpy).not.toHaveBeenCalled();

    // Restore mocks
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});