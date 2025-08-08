import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence
} from 'firebase/auth';
import { app } from '../firebase/config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AuthContext = createContext();

// Array of admin emails
const ADMIN_EMAILS = import.meta.env.VITE_ADMIN_EMAILS ? JSON.parse(import.meta.env.VITE_ADMIN_EMAILS) : [];

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth(app);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, [auth]);

    // Check if user is admin
    const isAdmin = () => {
        return user?.email && ADMIN_EMAILS.includes(user.email);
    };

    // Login function with remember me
    const login = async (email, password, rememberMe) => {
        try {
            // Set persistence based on rememberMe
            await setPersistence(auth,
                rememberMe
                    ? browserLocalPersistence  // Keep user logged in
                    : browserSessionPersistence 
            );

            await signInWithEmailAndPassword(auth, email, password);
            toast.success('Successfully logged in!');
            return true;
        } catch (error) {
            console.error("Login error:", error);

            // Provide user-friendly error messages based on Firebase error codes
            switch (error.code) {
                case 'auth/user-not-found':
                    toast.error('No account found with this email address');
                    break;
                case 'auth/wrong-password':
                    toast.error('Incorrect password');
                    break;
                case 'auth/invalid-credential':
                    toast.error('Invalid login credentials');
                    break;
                case 'auth/invalid-email':
                    toast.error('Please enter a valid email address');
                    break;
                case 'auth/too-many-requests':
                    toast.error('Too many failed login attempts. Please try again later or reset your password');
                    break;
                case 'auth/user-disabled':
                    toast.error('This account has been disabled. Please contact support');
                    break;
                case 'auth/network-request-failed':
                    toast.error('Network error. Please check your internet connection');
                    break;
                default:
                    toast.error('Login failed. Please check your credentials and try again');
            }

            return false;
        }
    };

    // Rest of your code remains the same
    const logout = async () => {
        try {
            await signOut(auth);
            toast.success('Logged out successfully');
            navigate('/');
        } catch (error) {
            toast.error('Failed to log out');
        }
    };

    const resetPassword = async (email) => {
        try {
            await sendPasswordResetEmail(auth, email);
            toast.success('Password reset email sent!');
            return true;
        } catch (error) {
            toast.error(error.message || 'Failed to send reset email');
            return false;
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        resetPassword,
        isAdmin
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};