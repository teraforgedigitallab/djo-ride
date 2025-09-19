import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Users, Car, DollarSign } from 'lucide-react';
import { collection, getDocs, doc, updateDoc, query, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { UserManagementTab, BookingManagementTab, PricingManagementTab, PasswordModal } from '../sections';
import { useAuth } from '../contexts/AuthContext';

// API endpoint for user approval
const API_ENDPOINT = 'https://djo-ride-backend.vercel.app/api/approve-user.js';


const Admin = () => {
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [generatedPassword, setGeneratedPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [processingUser, setProcessingUser] = useState(false);

    const { user } = useAuth();

    // Fetch users and bookings from Firestore
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch users without orderBy
                let usersData = [];
                try {
                    const simpleUsersQuery = query(collection(db, 'users'));
                    const usersSnapshot = await getDocs(simpleUsersQuery);

                    console.log('Found users:', usersSnapshot.size);

                    usersData = usersSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        // Set default status if not provided
                        status: doc.data().status || 'pending'
                    }));

                } catch (userError) {
                    console.error('Error fetching users:', userError);
                    toast.error('Error loading users');
                }

                // Fetch bookings
                let bookingsData = [];
                try {
                    const bookingsQuery = query(collection(db, 'bookings'));
                    const bookingsSnapshot = await getDocs(bookingsQuery);
                    bookingsData = bookingsSnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                } catch (bookingError) {
                    console.error('Error fetching bookings:', bookingError);
                    toast.error('Error loading bookings');
                }

                console.log('Fetched users data:', usersData);
                console.log('Fetched bookings data:', bookingsData);

                setUsers(usersData);
                setBookings(bookingsData);
            } catch (error) {
                console.error('Error in fetchData:', error);
                toast.error('Failed to load data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const generateRandomPassword = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        let password = '';
        for (let i = 0; i < 12; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    };

    const handlePasswordAssign = (user) => {
        setSelectedUser(user);
        setGeneratedPassword(generateRandomPassword());
        setIsModalOpen(true);
    };

    const regeneratePassword = () => {
        setGeneratedPassword(generateRandomPassword());
    };

    // Function to call your backend API to approve a user with CORS workaround for development
    const approveUser = async ({ email, password, userId }) => {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, userId }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({
                    error: `Server error: ${response.status}`
                }));
                throw new Error(errorData.error || 'Failed to approve user');
            }

            return await response.json();
        } catch (error) {
            console.error('API error:', error);
            throw error;
        }
    };

    const savePassword = async () => {
        try {
            setProcessingUser(true);

            if (!selectedUser || !selectedUser.email) {
                throw new Error('User email is required');
            }

            if (!generatedPassword || generatedPassword.length < 6) {
                throw new Error('Password must be at least 6 characters');
            }

            // Call backend API to create Firebase Auth user
            await approveUser({
                email: selectedUser.email,
                password: generatedPassword,
                userId: selectedUser.id
            });

            // Update user status in Firestore
            await updateDoc(doc(db, 'users', selectedUser.id), {
                status: 'approved',
                hasAuthAccount: true,
                updatedAt: serverTimestamp()
            });

            // Update local state
            setUsers(users.map(user =>
                user.id === selectedUser.id ? {
                    ...user,
                    status: 'approved',
                    hasAuthAccount: true
                } : user
            ));

            toast.success('User account created and approved successfully');

            setGeneratedPassword('');
            setSelectedUser(null);
            setShowPassword(false);
        } catch (error) {
            console.error('Error setting up user account:', error);
            toast.error(error.message || 'Failed to set up user account');
        } finally {
            setProcessingUser(false);
        }
    };

    // This function is now only for users who don't need auth accounts
    const updateUserStatus = async (userId, newStatus) => {
        try {
            // Update user status in Firestore
            await updateDoc(doc(db, 'users', userId), {
                status: newStatus,
                updatedAt: serverTimestamp()
            });

            // Update local state
            setUsers(users.map(user =>
                user.id === userId ? { ...user, status: newStatus } : user
            ));

            toast.success(`User status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto pt-32 pb-20 max-w-7xl">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
                        <p className="text-gray-600">Manage users, bookings & pricing.</p>
                    </div>
                </div>

                <Tab.Group>
                    <Tab.List className="flex p-1 space-x-2 bg-background rounded-xl mb-8">
                        <Tab className={({ selected }) =>
                            `w-full py-3 text-sm font-medium leading-5 rounded-lg transition-all duration-200 ease-in-out
        ${selected
                                ? 'bg-primary text-white shadow-md'
                                : 'text-primary hover:bg-secondary/20'}`
                        }>
                            <div className="flex items-center justify-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>User Management</span>
                            </div>
                        </Tab>
                        <Tab className={({ selected }) =>
                            `w-full py-3 text-sm font-medium leading-5 rounded-lg transition-all duration-200 ease-in-out
        ${selected
                                ? 'bg-primary text-white shadow-md'
                                : 'text-primary hover:bg-secondary/20'}`
                        }>
                            <div className="flex items-center justify-center space-x-2">
                                <Car className="h-5 w-5" />
                                <span>Booking Management</span>
                            </div>
                        </Tab>
                        {/* Add new Pricing Management Tab */}
                        <Tab className={({ selected }) =>
                            `w-full py-3 text-sm font-medium leading-5 rounded-lg transition-all duration-200 ease-in-out
        ${selected
                                ? 'bg-primary text-white shadow-md'
                                : 'text-primary hover:bg-secondary/20'}`
                        }>
                            <div className="flex items-center justify-center space-x-2">
                                <DollarSign className="h-5 w-5" />
                                <span>Pricing Management</span>
                            </div>
                        </Tab>
                    </Tab.List>

                    <Tab.Panels className="mt-2">
                        {/* User Management Tab */}
                        <Tab.Panel>
                            <UserManagementTab
                                users={users}
                                handlePasswordAssign={handlePasswordAssign}
                                updateUserStatus={updateUserStatus}
                            />
                        </Tab.Panel>

                        {/* Booking Management Tab */}
                        <Tab.Panel>
                            <BookingManagementTab bookings={bookings} />
                        </Tab.Panel>

                        {/* Add new Pricing Management Tab Panel */}
                        <Tab.Panel>
                            <PricingManagementTab />
                        </Tab.Panel>
                    </Tab.Panels>
                </Tab.Group>
            </div>

            {/* Password Assignment Modal */}
            <PasswordModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedUser={selectedUser}
                generatedPassword={generatedPassword}
                setGeneratedPassword={setGeneratedPassword}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                regeneratePassword={regeneratePassword}
                savePassword={savePassword}
                isProcessing={processingUser}
            />
        </div>
    );
};


export default Admin;

