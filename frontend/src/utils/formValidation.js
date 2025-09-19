export const emailValidation = {
    required: 'Email is required',
    pattern: {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Please enter a valid email address',
    },
};

export const passwordValidation = {
    required: 'Password is required',
    minLength: {
        value: 8,
        message: 'Password must be at least 8 characters long',
    },
};

export const fullNameValidation = {
    required: 'Your full name is required',
};

export const companyNameValidation = {
    required: 'Company name is required',
};

export const phoneValidation = {
    required: 'A contact phone number is required',
    pattern: {
        value: /^\d{10}$/, // Simple 10-digit phone number validation
        message: 'Please enter a valid 10-digit phone number',
    },
};

export const confirmPasswordValidation = (password) => ({
    required: 'Please confirm your password',
    validate: (value) =>
        value === password || 'The passwords do not match',
});

export const termsValidation = {
    required: 'You must accept the terms and conditions',
};
