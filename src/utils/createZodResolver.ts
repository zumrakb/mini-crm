import type {
  FieldError,
  FieldErrors,
  FieldValues,
  Resolver,
} from 'react-hook-form';
import type { z } from 'zod/v3';

type ZodSchema<TFieldValues extends FieldValues> = z.ZodType<
  TFieldValues,
  z.ZodTypeDef,
  TFieldValues
>;

export function createZodResolver<TFieldValues extends FieldValues>(
  schema: ZodSchema<TFieldValues>,
): Resolver<TFieldValues> {
  return async values => {
    const result = await schema.safeParseAsync(values);

    if (result.success) {
      return {
        values: result.data,
        errors: {},
      };
    }

    const errors = {} as FieldErrors<TFieldValues>;

    // Current forms use flat field keys, so the first path segment is enough.
    result.error.errors.forEach(issue => {
      const fieldName = issue.path[0];

      if (typeof fieldName !== 'string') {
        return;
      }

      if ((errors as Record<string, FieldError | undefined>)[fieldName]) {
        return;
      }

      (errors as Record<string, FieldError>)[fieldName] = {
        type: issue.code,
        message: issue.message,
      };
    });

    return {
      values: {} as Record<string, never>,
      errors,
    };
  };
}
