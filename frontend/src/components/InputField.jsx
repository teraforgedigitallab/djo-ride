import React from 'react';

const InputField = React.forwardRef(({ label, id, error, ...props }, ref) => {
    // This `error` prop comes from formState: { errors }
    const isInvalid = !!error;

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-text select-none">
                {label}
            </label>
            <input
                id={id}
                ref={ref}
                {...props}
                className={`mt-1 block w-full px-3 py-2 bg-white border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:ring-1 focus:border-primary sm:text-sm ${
                    isInvalid ? 'border-red-500 ring-red-500' : 'border-gray-300'
                }`}
                aria-invalid={isInvalid}
                aria-describedby={isInvalid ? `${id}-error` : undefined}
            />
            {/* When there is an error, this paragraph will be displayed */}
            {isInvalid && (
                <p id={`${id}-error`} className="mt-1 text-xs text-red-500" role="alert">
                    {error.message}
                </p>
            )}
        </div>
    );
});

export default InputField;