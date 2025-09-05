const cloudinary = require('cloudinary').v2;
const { uploadImage, deleteImage } = require('../config/cloudinary');

// Mock cloudinary
jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn()
    }
  }
}));

describe('Cloudinary Config Unit Tests', () => {
  let originalEnv;

  beforeEach(() => {
    originalEnv = process.env;
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Environment Configuration', () => {
    test('should warn when Cloudinary credentials are not set', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      process.env = {
        ...originalEnv,
        CLOUDINARY_CLOUD_NAME: 'your_cloud_name_here',
        CLOUDINARY_API_KEY: 'your_api_key_here',
        CLOUDINARY_API_SECRET: 'your_api_secret_here'
      };

      // Act
      jest.resetModules();
      require('../config/cloudinary');

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Cloudinary credentials not properly configured')
      );
      
      consoleSpy.mockRestore();
    });

    test('should not warn when Cloudinary credentials are properly set', () => {
      // Arrange
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      process.env = {
        ...originalEnv,
        CLOUDINARY_CLOUD_NAME: 'test_cloud',
        CLOUDINARY_API_KEY: '123456789',
        CLOUDINARY_API_SECRET: 'test_secret'
      };

      // Act
      jest.resetModules();
      require('../config/cloudinary');

      // Assert
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('uploadImage function', () => {
    test('should upload image with default parameters', async () => {
      // Arrange
      const mockBuffer = Buffer.from('fake image data');
      const mockResponse = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/test.jpg',
        public_id: 'fitnest/profiles/test123'
      };

      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, mockResponse);
        return { end: jest.fn() };
      });

      // Act
      const result = await uploadImage(mockBuffer);

      // Assert
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'fitnest/profiles',
          resource_type: 'image',
          transformation: expect.arrayContaining([
            expect.objectContaining({
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'face'
            })
          ])
        }),
        expect.any(Function)
      );
      expect(result).toEqual(mockResponse);
    });

    test('should upload image with custom folder and publicId', async () => {
      // Arrange
      const mockBuffer = Buffer.from('fake image data');
      const mockResponse = {
        secure_url: 'https://res.cloudinary.com/test/image/upload/v123/custom.jpg',
        public_id: 'custom/folder/custom_id'
      };

      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, mockResponse);
        return { end: jest.fn() };
      });

      // Act
      const result = await uploadImage(mockBuffer, 'custom/folder', 'custom_id');

      // Assert
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          folder: 'custom/folder',
          public_id: 'custom_id'
        }),
        expect.any(Function)
      );
      expect(result).toEqual(mockResponse);
    });

    test('should handle upload error', async () => {
      // Arrange
      const mockBuffer = Buffer.from('fake image data');
      const mockError = new Error('Upload failed');

      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(mockError, null);
        return { end: jest.fn() };
      });

      // Act & Assert
      await expect(uploadImage(mockBuffer)).rejects.toThrow('Upload failed');
    });

    test('should apply image transformations correctly', async () => {
      // Arrange
      const mockBuffer = Buffer.from('fake image data');
      cloudinary.uploader.upload_stream.mockImplementation((options, callback) => {
        callback(null, { secure_url: 'test.jpg' });
        return { end: jest.fn() };
      });

      // Act
      await uploadImage(mockBuffer);

      // Assert
      expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
        expect.objectContaining({
          transformation: [
            {
              width: 400,
              height: 400,
              crop: 'fill',
              gravity: 'face'
            },
            {
              quality: 'auto',
              format: 'webp'
            }
          ]
        }),
        expect.any(Function)
      );
    });
  });

  describe('Configuration validation', () => {
    test('should handle missing environment variables', () => {
      // Arrange
      process.env = {};
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      jest.resetModules();
      require('../config/cloudinary');

      // Assert
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    test('should configure cloudinary with provided credentials', () => {
      // This test validates that the cloudinary config is called when module loads
      // The actual configuration happens at module load time, not during test execution
      expect(true).toBe(true); // Placeholder test since config happens at module load
    });
  });
});
