import { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { Users, Car, DollarSign, Image, Eye, EyeOff } from 'lucide-react';
import { collection, doc, updateDoc, query, serverTimestamp, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toast } from 'react-hot-toast';
import { UserManagementTab, BookingManagementTab, PricingManagementTab, CityImageManagementTab, PasswordModal } from '../sections';
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

    // Super admin password prompt state
    const [showSuperAdminPrompt, setShowSuperAdminPrompt] = useState(false);
    const [superAdminInput, setSuperAdminInput] = useState('');
    const [superAdminError, setSuperAdminError] = useState('');
    const [pricingTabUnlocked, setPricingTabUnlocked] = useState(false);
    const [showSuperAdminPassword, setShowSuperAdminPassword] = useState(false);
    const superAdminPassword = import.meta.env.VITE_SUPER_ADMIN_PASSWORD || '';

    const pricingTabIndex = 2; // 0: User, 1: Booking, 2: Pricing, 3: City Images
    const [selectedTab, setSelectedTab] = useState(0);

    const { user } = useAuth();

    // Fetch users and bookings from Firestore with real-time updates
    useEffect(() => {
        // Set loading state
        setLoading(true);

        // Create real-time listeners for users and bookings
        const unsubscribeUsers = onSnapshot(
            collection(db, 'users'),
            (snapshot) => {
                const usersData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                    status: doc.data().status || 'pending'
                }));
                setUsers(usersData);
                // Don't set loading to false here, as we're waiting for both collections
            },
            (error) => {
                console.error('Error fetching users:', error);
                toast.error('Error loading users');
                // Only set loading to false if both listeners failed
                setLoading(false);
            }
        );

        // Create query for bookings, ordered by creation date
        const bookingsQuery = query(
            collection(db, 'bookings'),
            orderBy('createdAt', 'desc')
        );

        // Set up real-time listener for bookings
        const unsubscribeBookings = onSnapshot(
            bookingsQuery,
            (snapshot) => {
                const bookingsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setBookings(bookingsData);
                // Both collections are now loaded
                setLoading(false);
            },
            (error) => {
                console.error('Error fetching bookings:', error);
                toast.error('Error loading bookings');
                setLoading(false);
            }
        );

        // Clean up listeners when component unmounts
        return () => {
            unsubscribeUsers();
            unsubscribeBookings();
        };
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

    // Function to call your backend API to approve a user
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

            if (!generatedPassword || generatedPassword.length < 8) {
                throw new Error('Password must be at least 8 characters');
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

            // Local state is automatically updated by the onSnapshot listener

            toast.success('User account created and approved successfully');

            setGeneratedPassword('');
            setSelectedUser(null);
            setShowPassword(false);
            setIsModalOpen(false);
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

            // No need to update local state as onSnapshot will handle it
            toast.success(`User status updated to ${newStatus}`);
        } catch (error) {
            console.error('Error updating user status:', error);
            toast.error('Failed to update user status');
        }
    };

    // Handler for booking updates from BookingManagementTab
    const handleBookingsUpdate = (updatedBookings) => {
        // No need to manually update state as we're using onSnapshot
        // This is just a fallback in case we want to do something special
        console.log("Bookings updated in child component");
    };

    // Tab change handler with super admin password prompt for Pricing tab
    const handleTabChange = (index) => {
        if (index === pricingTabIndex && !pricingTabUnlocked) {
            setShowSuperAdminPrompt(true);
            setSuperAdminInput('');
            setSuperAdminError('');
            setShowSuperAdminPassword(false);
            return; // Prevent tab switch
        }
        setSelectedTab(index);
    };

    // Handler for super admin password submit
    const handleSuperAdminSubmit = (e) => {
        e.preventDefault();
        if (superAdminInput === superAdminPassword) {
            setPricingTabUnlocked(true);
            setShowSuperAdminPrompt(false);
            setSelectedTab(pricingTabIndex);
        } else {
            setSuperAdminError('Incorrect password. Please try again.');
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
                        <p className="text-gray-600">Manage users, bookings, pricing & city images.</p>
                    </div>
                </div>

                <Tab.Group selectedIndex={selectedTab} onChange={handleTabChange}>
                    <Tab.List className="flex p-1 space-x-2 bg-background rounded-xl mb-8 overflow-x-auto">
                        {/* User Management Tab */}
                        <Tab className={({ selected }) =>
                            `w-full py-3 text-sm font-medium leading-5 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap
                            ${selected
                                ? 'bg-primary text-white shadow-md'
                                : 'text-primary hover:bg-secondary/20'}`
                        }>
                            <div className="flex items-center justify-center space-x-2">
                                <Users className="h-5 w-5" />
                                <span>User Management</span>
                            </div>
                        </Tab>

                        {/* Booking Management Tab */}
                        <Tab className={({ selected }) =>
                            `w-full py-3 text-sm font-medium leading-5 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap
                            ${selected
                                ? 'bg-primary text-white shadow-md'
                                : 'text-primary hover:bg-secondary/20'}`
                        }>
                            <div className="flex items-center justify-center space-x-2">
                                <Car className="h-5 w-5" />
                                <span>Booking Management</span>
                            </div>
                        </Tab>

                        {/* Pricing Management Tab */}
                        <Tab className={({ selected }) =>
                            `w-full py-3 text-sm font-medium leading-5 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap
                            ${selected
                                ? 'bg-primary text-white shadow-md'
                                : 'text-primary hover:bg-secondary/20'}`
                        }>
                            <div className="flex items-center justify-center space-x-2">
                                <DollarSign className="h-5 w-5" />
                                <span>Pricing Management</span>
                            </div>
                        </Tab>

                        {/* City Image Management Tab */}
                        <Tab className={({ selected }) =>
                            `w-full py-3 text-sm font-medium leading-5 rounded-lg transition-all duration-200 ease-in-out whitespace-nowrap
                            ${selected
                                ? 'bg-primary text-white shadow-md'
                                : 'text-primary hover:bg-secondary/20'}`
                        }>
                            <div className="flex items-center justify-center space-x-2">
                                <Image className="h-5 w-5" />
                                <span>City Images</span>
                            </div>
                        </Tab>
                    </Tab.List>

                    <Tab.Panels className="mt-2">
                        {/* User Management Tab Panel */}
                        <Tab.Panel>
                            <UserManagementTab
                                users={users}
                                handlePasswordAssign={handlePasswordAssign}
                                updateUserStatus={updateUserStatus}
                            />
                        </Tab.Panel>

                        {/* Booking Management Tab Panel */}
                        <Tab.Panel>
                            <BookingManagementTab 
                                bookings={bookings} 
                                onBookingsUpdate={handleBookingsUpdate} 
                            />
                        </Tab.Panel>

                        {/* Pricing Management Tab Panel */}
                        <Tab.Panel>
                            {pricingTabUnlocked ? (
                                <PricingManagementTab
                                    pricingCollectionName="pricing"
                                    countriesCollectionName="Countries"
                                    useDropdownsForLocation={true}
                                    enforcePricingOnCityAdd={true}
                                    atomicCityPricing={true}
                                    categoryRemovalSetsNull={true}
                                    bulkDeleteLogic={{
                                        city: true,
                                        state: true,
                                        country: true
                                    }}
                                />
                            ) : (
                                <div className="text-center text-gray-500 py-10">
                                    Please enter the super admin password to access this tab.
                                </div>
                            )}
                        </Tab.Panel>

                        {/* City Image Management Tab Panel */}
                        <Tab.Panel>
                            <CityImageManagementTab />
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

            {/* Super Admin Password Prompt Modal */}
            {showSuperAdminPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <form
                        className="bg-white rounded-lg shadow-lg p-8 w-full max-w-sm"
                        onSubmit={handleSuperAdminSubmit}
                    >
                        <h2 className="text-xl font-semibold mb-4 text-primary">Super Admin Password</h2>
                        <div className="relative mb-2">
                            <input
                                type={showSuperAdminPassword ? 'text' : 'password'}
                                className="w-full border border-gray-300 rounded px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Enter super admin password"
                                value={superAdminInput}
                                onChange={e => setSuperAdminInput(e.target.value)}
                                autoFocus
                            />
                            <button
                                type="button"
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary"
                                tabIndex={-1}
                                onClick={() => setShowSuperAdminPassword(v => !v)}
                                aria-label={showSuperAdminPassword ? 'Hide password' : 'Show password'}
                            >
                                {showSuperAdminPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {superAdminError && (
                            <div className="text-red-500 text-sm mb-2">{superAdminError}</div>
                        )}
                        <div className="flex justify-end space-x-2 mt-4">
                            <button
                                type="button"
                                className="px-4 py-2 rounded bg-gray-200 text-gray-700"
                                onClick={() => setShowSuperAdminPrompt(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 rounded bg-primary text-white"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Admin;