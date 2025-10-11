jest.mock('multer', () => {
  const actual = jest.requireActual('multer');
  return Object.assign(jest.fn(() => ({ single: jest.fn(), none: jest.fn() })), actual, {
    memoryStorage: jest.fn(() => ({ storage: 'memory' }))
  });
});

describe('multer config', () => {
  beforeEach(() => jest.resetModules());

  test('exports an upload instance with limits', () => {
    const multer = require('multer');
    const upload = require('../config/multer');
    expect(multer).toHaveBeenCalled();
    const callArg = multer.mock.calls[0][0];
    expect(callArg.limits.fileSize).toBe(10 * 1024 * 1024);
  });

  test('fileFilter accepts images and rejects others', () => {
    jest.isolateModules(() => {
      const multerModule = require('../config/multer');
      // Access fileFilter via requiring module again is tricky; instead, simulate by invoking through multer mock
      const multer = require('multer');
      const cfg = multer.mock.calls[0][0];
      const { fileFilter } = cfg;

      const cb = jest.fn();
      fileFilter({}, { mimetype: 'image/png' }, cb);
      expect(cb).toHaveBeenCalledWith(null, true);

      const cb2 = jest.fn();
      fileFilter({}, { mimetype: 'application/pdf' }, cb2);
      expect(cb2).toHaveBeenCalled();
      const errArg = cb2.mock.calls[0][0];
      expect(errArg).toBeInstanceOf(Error);
      expect(errArg.message).toMatch(/Only image files/);
      expect(multerModule).toBeDefined();
    });
  });
});
