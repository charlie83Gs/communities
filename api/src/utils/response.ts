import { Response } from 'express';

export class ApiResponse {
  static success<T>(res: Response, data: T, message = 'Success') {
    return res.status(200).json({
      status: 'success',
      message,
      data,
    });
  }

  static created<T>(res: Response, data: T, message = 'Created successfully') {
    return res.status(201).json({
      status: 'success',
      message,
      data,
    });
  }

  static error(res: Response, message = 'Error', statusCode = 500) {
    return res.status(statusCode).json({
      status: 'error',
      message,
    });
  }

  static noContent(res: Response) {
    return res.status(204).send();
  }
}
