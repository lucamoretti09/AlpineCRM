import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import { ValidationError as AppValidationError } from './errorHandler';

export const validate = (req: Request, _res: Response, next: NextFunction) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((error: ValidationError) => {
        if ('path' in error && 'msg' in error) {
          return `${error.path}: ${error.msg}`;
        }
        return error.msg;
      })
      .join(', ');

    return next(new AppValidationError(errorMessages));
  }

  next();
};
