import { useState, useCallback, useMemo } from 'react';
import { z, ZodSchema, ZodError } from 'zod';

type FieldErrors<T> = Partial<Record<keyof T, string>>;

interface UseFormOptions<T extends Record<string, any>> {
  initialValues: T;
  schema?: ZodSchema<T>;
  onSubmit: (values: T) => void | Promise<void>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: FieldErrors<T>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  handleChange: (field: keyof T) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: any) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setValues: (values: Partial<T>) => void;
  reset: () => void;
  resetField: (field: keyof T) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  schema,
  onSubmit,
  validateOnChange = false,
  validateOnBlur = true,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FieldErrors<T>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initialValues);
  }, [values, initialValues]);

  const isValid = useMemo(() => {
    if (!schema) return true;
    try {
      schema.parse(values);
      return true;
    } catch {
      return false;
    }
  }, [values, schema]);

  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!schema) return true;

      try {
        schema.parse(values);
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
        return true;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = error.errors.find(
            (e) => e.path[0] === field
          );
          if (fieldError) {
            setErrors((prev) => ({
              ...prev,
              [field]: fieldError.message,
            }));
            return false;
          }
        }
        return true;
      }
    },
    [schema, values]
  );

  const validateForm = useCallback((): boolean => {
    if (!schema) return true;

    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: FieldErrors<T> = {};
        error.errors.forEach((e) => {
          const field = e.path[0] as keyof T;
          if (!newErrors[field]) {
            newErrors[field] = e.message;
          }
        });
        setErrors(newErrors);
        return false;
      }
      return false;
    }
  }, [schema, values]);

  const handleChange = useCallback(
    (field: keyof T) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const value = e.target.type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : e.target.value;

        setValuesState((prev) => ({ ...prev, [field]: value }));

        if (validateOnChange) {
          // Defer validation to next tick to get updated value
          setTimeout(() => validateField(field), 0);
        }
      },
    [validateOnChange, validateField]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      if (validateOnBlur) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      // Mark all fields as touched
      const allTouched = Object.keys(values).reduce(
        (acc, key) => ({ ...acc, [key]: true }),
        {} as Partial<Record<keyof T, boolean>>
      );
      setTouched(allTouched);

      // Validate form
      if (!validateForm()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit]
  );

  const setFieldValue = useCallback((field: keyof T, value: any) => {
    setValuesState((prev) => ({ ...prev, [field]: value }));
  }, []);

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, []);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const resetField = useCallback(
    (field: keyof T) => {
      setValuesState((prev) => ({ ...prev, [field]: initialValues[field] }));
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
      setTouched((prev) => {
        const newTouched = { ...prev };
        delete newTouched[field];
        return newTouched;
      });
    },
    [initialValues]
  );

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    setFieldError,
    setValues,
    reset,
    resetField,
    validateField,
    validateForm,
  };
}

// Common validation schemas
export const validationSchemas = {
  email: z.string().email('Ogiltig e-postadress'),
  password: z
    .string()
    .min(8, 'Lösenord måste vara minst 8 tecken')
    .regex(/[A-Z]/, 'Lösenord måste innehålla minst en stor bokstav')
    .regex(/[0-9]/, 'Lösenord måste innehålla minst en siffra'),
  required: (message = 'Detta fält är obligatoriskt') =>
    z.string().min(1, message),
  phone: z
    .string()
    .regex(/^(\+46|0)[0-9]{6,12}$/, 'Ogiltigt telefonnummer'),
  url: z.string().url('Ogiltig URL'),
  number: z.number(),
  positiveNumber: z.number().positive('Måste vara ett positivt tal'),
  orgNumber: z
    .string()
    .regex(/^\d{10}$/, 'Organisationsnummer måste vara 10 siffror'),
};
