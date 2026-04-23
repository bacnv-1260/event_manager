import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export function validate(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) break;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        details: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : e.type, message: e.msg })),
      });
      return;
    }

    next();
  };
}
