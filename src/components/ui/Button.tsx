import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'text';
    fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', fullWidth = false, children, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-lg cursor-pointer';

        const variants = {
            primary: 'bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white py-3 px-6 shadow-sm hover:shadow-md focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-500',
            secondary: 'bg-white hover:bg-gray-50 active:bg-gray-100 text-emerald-600 border-2 border-emerald-500 py-3 px-6 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed',
            text: 'text-emerald-600 hover:text-emerald-700 hover:underline p-0 bg-transparent focus:ring-emerald-500',
        };

        const widthStyles = fullWidth ? 'w-full' : '';

        return (
            <button
                className={`${baseStyles} ${variants[variant]} ${widthStyles} ${className}`}
                ref={ref}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
