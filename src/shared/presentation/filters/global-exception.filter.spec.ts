import { GlobalExceptionFilter } from './global-exception.filter';
import { ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { DomainException } from '../../domain/errors/domain.exception';
import { Request, Response } from 'express';

class TestDomainException extends DomainException {
  code = 'TEST_ERROR';

  constructor() {
    super('Test domain error');
  }
}

class UnknownDomainException extends DomainException {
  code = 'UNKNOWN_CODE';

  constructor() {
    super('Unknown domain error');
  }
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: jest.Mocked<Response>;
  let mockRequest: jest.Mocked<Request>;
  let mockHost: ArgumentsHost;
  let loggerSpy: jest.SpyInstance;

  beforeAll(() => {
    loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => {});
  });

  afterAll(() => {
    loggerSpy.mockRestore();
  });

  beforeEach(() => {
    filter = new GlobalExceptionFilter();

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as jest.Mocked<Response>;

    mockRequest = {
      method: 'GET',
      originalUrl: '/test',
    } as unknown as jest.Mocked<Request>;

    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('DomainException handling', () => {
    it('should map known domain error codes to correct HTTP status', () => {
      const exception = new TestDomainException();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'TEST_ERROR',
          message: 'Test domain error',
          method: 'GET',
          path: '/test',
        }),
      );
    });

    it('should map PRODUCT_NOT_FOUND to 404', () => {
      const exception = new (class extends DomainException {
        code = 'PRODUCT_NOT_FOUND';
        constructor() {
          super('Product not found');
        }
      })();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('should map INSUFFICIENT_STOCK to 400', () => {
      const exception = new (class extends DomainException {
        code = 'INSUFFICIENT_STOCK';
        constructor() {
          super('Insufficient stock');
        }
      })();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });

    it('should map PRODUCT_ALREADY_EXISTS to 409', () => {
      const exception = new (class extends DomainException {
        code = 'PRODUCT_ALREADY_EXISTS';
        constructor() {
          super('Product already exists');
        }
      })();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    });

    it('should default to 400 for unknown domain error codes', () => {
      const exception = new UnknownDomainException();

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    });
  });

  describe('HttpException handling', () => {
    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Bad request', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          message: 'Bad request',
        }),
      );
    });

    it('should handle HttpException with object response containing message array', () => {
      const exception = new HttpException(
        { message: ['field1 is required', 'field2 is invalid'], error: 'Validation' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 400,
          code: 'Validation',
          message: 'field1 is required, field2 is invalid',
        }),
      );
    });

    it('should handle HttpException with object response containing string message', () => {
      const exception = new HttpException(
        { message: 'Not found', error: 'Error' },
        HttpStatus.NOT_FOUND,
      );

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Not found',
        }),
      );
    });
  });

  describe('unknown exception handling', () => {
    it('should return 500 for unknown exceptions', () => {
      const exception = new Error('Something went wrong');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 500,
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred.',
        }),
      );
    });
  });

  describe('response format', () => {
    it('should include timestamp in the response', () => {
      const exception = new TestDomainException();

      filter.catch(exception, mockHost);

      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.timestamp).toBeDefined();
      expect(new Date(responseCall.timestamp).getTime()).not.toBeNaN();
    });

    it('should include method and path from request', () => {
      mockRequest.method = 'POST';
      mockRequest.originalUrl = '/inventory/adjustments';

      const exception = new TestDomainException();

      filter.catch(exception, mockHost);

      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          method: 'POST',
          path: '/inventory/adjustments',
        }),
      );
    });
  });
});
