'use client';

import { useState, useCallback, useEffect } from 'react';
import { z, ZodSchema, ZodError } from 'zod';

/**
 * useFormValidation Hook
 * Realtime form validation with Zod
 */

interface UseFormValidationOptions<T> {
  schema: ZodSchema<T>;
  initialValues?: Partial<T>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FieldState {
  value: string;
  error: string | null;
  touched: boolean;
}

type FormState<T> = {
  [K in keyof T]: FieldState;
};

interface UseFormValidationReturn<T> {
  values: Partial<T>;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  handleChange: (name: keyof T, value: unknown) => void;
  handleBlur: (name: keyof T) => void;
  validateField: (name: keyof T) => string | null;
  validateForm: () => boolean;
  reset: () => void;
  setSubmitting: (isSubmitting: boolean) => void;
  getFieldProps: (name: keyof T) => {
    value: unknown;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur: () => void;
    error: string | null;
  };
}

export function useFormValidation<T extends Record<string, unknown>>({
  schema,
  initialValues = {} as Partial<T>,
  validateOnChange = true,
  validateOnBlur = true,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const [values, setValues] = useState<Partial<T>>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T): string | null => {
      try {
        // Create partial schema for single field validation
        const fieldSchema = (schema as z.ZodObject<z.ZodRawShape>).pick({
          [name]: true,
        } as Record<string, true>);
        fieldSchema.parse({ [name]: values[name] });
        return null;
      } catch (error) {
        if (error instanceof ZodError) {
          const fieldError = (error as any).errors.find(
            (e: any) => e.path[0] === name
          );
          return fieldError?.message || null;
        }
        return null;
      }
    },
    [schema, values]
  );

  const handleChange = useCallback(
    (name: keyof T, value: unknown) => {
      setValues((prev) => ({ ...prev, [name]: value }));

      if (validateOnChange && touched[name]) {
        const error = validateField(name);
        setErrors((prev) => ({ ...prev, [name]: error || undefined }));
      }
    },
    [validateOnChange, touched, validateField]
  );

  const handleBlur = useCallback(
    (name: keyof T) => {
      setTouched((prev) => ({ ...prev, [name]: true }));

      if (validateOnBlur) {
        const error = validateField(name);
        setErrors((prev) => ({ ...prev, [name]: error || undefined }));
      }
    },
    [validateOnBlur, validateField]
  );

  const validateForm = useCallback((): boolean => {
    try {
      schema.parse(values);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Partial<Record<keyof T, string>> = {};
        (error as any).errors.forEach((e: any) => {
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

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const getFieldProps = useCallback(
    (name: keyof T) => ({
      value: values[name] ?? '',
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
          e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        handleChange(name, value);
      },
      onBlur: () => handleBlur(name),
      error: touched[name] ? errors[name] || null : null,
    }),
    [values, touched, errors, handleChange, handleBlur]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    reset,
    setSubmitting: setIsSubmitting,
    getFieldProps,
  };
}

/**
 * FormField Component with realtime validation
 */
interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: unknown;
  error: string | null;
  touched?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  error,
  onChange,
  onBlur,
  required,
  disabled,
  className,
}: FormFieldProps) {
  const hasError = !!error;

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-surface-700 mb-1"
      >
        {label}
        {required && <span className="text-error-500 ml-1">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value as string}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-4 py-2.5 rounded-xl border transition-colors
          focus:outline-none focus:ring-2 focus:ring-primary-500/20
          ${
            hasError
              ? 'border-error-300 bg-error-50 text-error-900 focus:border-error-500'
              : 'border-surface-200 bg-white focus:border-primary-500'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${name}-error` : undefined}
      />

      {/* Error Message with animation */}
      <div
        className={`
          overflow-hidden transition-all duration-200 ease-out
          ${hasError ? 'max-h-10 opacity-100 mt-1' : 'max-h-0 opacity-0'}
        `}
      >
        <p
          id={`${name}-error`}
          className="text-sm text-error-600 flex items-center gap-1"
          role="alert"
        >
          <svg
            className="w-4 h-4 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      </div>
    </div>
  );
}

export default useFormValidation;
