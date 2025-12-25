import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    error?: boolean;
    helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ className, error, helperText, ...props }, ref) => {
        return (
            <div className="w-full">
                <input
                    ref={ref}
                    className={clsx(
                        'w-full px-4 py-2.5 rounded-lg border transition-all duration-200',
                        'text-gray-900 placeholder:text-gray-400',
                        'focus:outline-none focus:ring-2 focus:ring-offset-1',
                        'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-50',
                        {
                            'border-gray-300 focus:border-blue-500 focus:ring-blue-500/50': !error,
                            'border-red-500 focus:border-red-500 focus:ring-red-500/50': error,
                        },
                        className
                    )}
                    {...props}
                />
                {helperText && (
                    <p
                        className={clsx('mt-1.5 text-sm', {
                            'text-gray-600': !error,
                            'text-red-600': error,
                        })}
                    >
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
