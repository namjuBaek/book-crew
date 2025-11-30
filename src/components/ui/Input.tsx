import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        {label}
                    </label>
                )}
                <input
                    className={`w-full px-4 py-3 rounded-lg border-2 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${error
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-emerald-500 focus:ring-emerald-200'
                        } ${className}`}
                    ref={ref}
                    {...props}
                />
                {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
            </div>
        );
    }
);

Input.displayName = 'Input';
