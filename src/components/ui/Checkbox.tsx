import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        className="peer sr-only"
                        ref={ref}
                        {...props}
                    />
                    <div className={`w-5 h-5 border-2 border-gray-300 rounded bg-white peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-focus:ring-2 peer-focus:ring-emerald-200 transition-all ${className}`}></div>
                    <svg
                        className="absolute w-3 h-3 text-white left-1 top-1 opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                </div>
                {label && (
                    <span className="ml-2.5 text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">
                        {label}
                    </span>
                )}
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';
