import { useForm } from 'react-hook-form';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { emailValidation, passwordValidation } from '../utils/formValidation';
import { LogIn, Eye, EyeClosed, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Login = () => {
    const navigate = useNavigate();
    const { login, resetPassword } = useAuth();

    // Get the redirect path from location state or default to home
    const from = '/#how-it-works';

    // State for reset password modal
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetting, setResetting] = useState(false);

    const {
        register,
        handleSubmit,
        getValues,
        formState: { errors, isSubmitting },
    } = useForm({
        mode: 'onBlur',
        defaultValues: {
            email: '',
            password: '',
            rememberMe: localStorage.getItem('rememberMe') === 'true' || false
        }
    });

    // State for show/hide password
    const [showPassword, setShowPassword] = useState(false);

    const onSubmit = async (data) => {
        // Save rememberMe preference in localStorage
        localStorage.setItem('rememberMe', data.rememberMe);

        const success = await login(data.email, data.password, data.rememberMe);
        if (success) {
            // Navigate to the page they were trying to access or to home
            navigate(from, { replace: true });
        }
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setShowResetModal(true);
        // Pre-fill with email from form if available
        setResetEmail(getValues('email') || '');
    };

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        if (!resetEmail || !resetEmail.includes('@')) {
            toast.error('Please enter a valid email address');
            return;
        }

        try {
            setResetting(true);
            await resetPassword(resetEmail);
            toast.success('Password reset email sent! Check your inbox');
            setShowResetModal(false);
        } catch (error) {
            toast.error(error.message || 'Failed to send reset email');
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-secondary">
                    Welcome Back!
                </h1>

                <div className="p-3 bg-primary/10 rounded-lg text-sm text-primary text-center">
                    Please log in to continue.
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    <InputField
                        id="email"
                        label="Email Address"
                        type="email"
                        error={errors.email}
                        {...register('email', emailValidation)}
                        autoComplete="email"
                    />
                    {/* Password field with show/hide */}
                    <div className="relative">
                        <InputField
                            id="password"
                            label="Password"
                            type={showPassword ? 'text' : 'password'}
                            error={errors.password}
                            {...register('password', passwordValidation)}
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-3 top-9 text-text"
                            onClick={() => setShowPassword((prev) => !prev)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeClosed size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center">
                            <input
                                id="rememberMe"
                                type="checkbox"
                                {...register('rememberMe')}
                                className="h-4 w-4 text-primary focus:ring-primary-dark border-gray-300 rounded accent-primary"
                                autoComplete='off'
                            />
                            <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-900 select-none">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <button
                                type="button"
                                onClick={handleForgotPassword}
                                className="font-medium text-primary hover:underline"
                            >
                                Forgot password?
                            </button>
                        </div>
                    </div>

                    <Button type="submit" size='md' disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Logging In...' : 'Login'}
                        <motion.div
                            animate={{ x: [0, 5, 0] }}
                            transition={{ repeat: Infinity, duration: 1.5, repeatDelay: 2 }}
                        >
                            <LogIn size={18} className="transform" />
                        </motion.div>
                    </Button>
                </form>

                <p className="text-sm text-center text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/signup" className="font-medium text-primary hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>

            {/* Password Reset Modal */}
            {showResetModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h2 className="text-xl font-bold mb-4">Reset Password</h2>
                        <p className="text-gray-600 mb-4">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>

                        <form onSubmit={handlePasswordReset} className="space-y-4">
                            <div className="relative">
                                <InputField
                                    id="resetEmail"
                                    label="Email Address"
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    required
                                />
                                <Mail size={18} className="absolute right-3 top-9 text-gray-400" />
                            </div>

                            <div className="flex gap-3 justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowResetModal(false)}
                                    disabled={resetting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={resetting}
                                >
                                    {resetting ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Login;