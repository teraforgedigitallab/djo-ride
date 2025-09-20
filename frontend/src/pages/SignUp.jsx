import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { collection, doc, addDoc, query, where, getDocs, setDoc } from "firebase/firestore";
import { db } from '../firebase/config';
import Button from '../components/Button';
import InputField from '../components/InputField';
import { fullNameValidation, companyNameValidation, emailValidation, termsValidation } from '../utils/formValidation';
import { Link, useNavigate } from 'react-router-dom';
import isDisposableEmail from 'is-disposable-email';
import PhoneInput from 'react-phone-input-2';

const SignUp = () => {

    const navigate = useNavigate();

    const [phone, setPhone] = useState('')

    const { register, handleSubmit, watch, getValues, formState: { errors, isSubmitting } } = useForm({ mode: 'onBlur' });

    const publicDomains = [
        'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'icloud.com', 'protonmail.com', 'rediffmail.com', 'zoho.com', 'mail.com'
    ];

    const businessEmailValidation = {
        ...emailValidation,
        validate: async (value) => {
            const domain = value.split('@')[1]?.toLowerCase();
            if (!domain) return 'Please enter a valid email address';

            // Block public/free domains
            if (publicDomains.some(d => domain === d)) {
                toast.error('Please enter a business email ID.');
                return false;
            }

            // Block disposable domains
            if (isDisposableEmail(value)) {
                toast.error('Disposable/temporary email addresses are not allowed. Please enter a business email ID.');
                return false;
            }

            // Kickbox API for real-time disposable check
            try {
                const res = await fetch(`https://open.kickbox.com/v1/disposable/${value}`);
                const data = await res.json();
                if (data.disposable) {
                    toast.error('Disposable/temporary email addresses are not allowed. Please enter a business email ID.');
                    return false;
                }
            } catch {
                toast.error('Could not verify email. Please try again.');
                return false;
            }

            // Custom denylist for new domains
            const customDenyList = ['hostbyt.com', 'foboxs.com', 'anothernewtemp.com'];
            if (customDenyList.includes(domain)) {
                toast.error('Disposable/temporary email addresses are not allowed. Please enter a business email ID.');
                return false;
            }

            return true;
        }
    };

    const onSubmit = async (data) => {
        try {
            const { password, confirmPassword, ...userData } = data;
            userData.phone = phone;
            userData.status = 'pending';

            const q = query(collection(db, "users"), where("email", "==", userData.email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                toast.error('This email is already registered. Please use a different email.');
                return;
            }

            await setDoc(doc(db, "users", userData.email), userData);
            toast.success('Account request submitted ! Your request will be approved within 24 hours.');
            navigate('/');
        } catch (error) {
            toast.error('Sign up failed. Please try again later.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4 py-25">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-secondary">Create your Business Account</h1>
                    <p className="mt-2 text-sm text-primary">
                        Streamline airport travel for your employees and clients.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6" noValidate>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField
                            id="fullName"
                            label="Authorized Person Name"
                            type="text"
                            error={errors.fullName}
                            {...register('fullName', fullNameValidation)}
                            autoComplete="name"
                        />
                        <InputField
                            id="companyName"
                            label="Company / Agency Name"
                            type="text"
                            error={errors.companyName}
                            {...register('companyName', companyNameValidation)}
                            autoComplete="organization"
                        />
                    </div>

                    <InputField
                        id="email"
                        label="Business Email Address"
                        type="email"
                        error={errors.email}
                        {...register('email', {
                            ...businessEmailValidation,
                            validate: (value) => businessEmailValidation.validate(value, getValues())
                        })}
                        autoComplete="email"
                    />

                    <PhoneInput
                        country={'in'}
                        value={phone}
                        onChange={setPhone}
                        inputProps={{
                            name: 'phone',
                            required: true,
                            className: 'w-full p-3 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pl-12'
                        }}
                    />

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                type="checkbox"
                                {...register('terms', termsValidation)}
                                className="h-4 w-4 text-primary focus:ring-primary border-primary rounded accent-primary"
                                aria-describedby="terms-error"
                                autoComplete="off"
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="font-light text-text">
                                I accept the{' '}
                                <a href="#" className="font-medium text-primary hover:underline">
                                    Terms and Conditions
                                </a>
                            </label>
                            {errors.terms && (
                                <p id="terms-error" className="mt-1 text-xs text-red-500">
                                    {errors.terms.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <Button type="submit" size='md' disabled={isSubmitting} className="w-full">
                        {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </Button>
                </form>

                <p className="text-sm text-center text-text">
                    Already have an account?{' '}
                    <Link to='/login' className="font-medium text-primary hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default SignUp;