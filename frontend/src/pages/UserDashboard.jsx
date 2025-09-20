import { useState, useEffect, useMemo } from 'react';
import { Calendar, MapPin, DollarSign, ArrowDownAZ, ArrowUpAZ, Search, Users, RefreshCw, CheckCircle, AlertTriangle, Clock, Ban, CreditCard } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import BankDetailsModal from '../components/BankDetailsModal';

const UserDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showBankModal, setShowBankModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [modalMode, setModalMode] = useState('payment'); // 'payment' or 'contact'
    const { user } = useAuth();

    // State for sorting and filtering
    const [sortField, setSortField] = useState('createdAt');
    const [sortDirection, setSortDirection] = useState('desc');
    const [filterCity, setFilterCity] = useState('');
    const [filterCountry, setFilterCountry] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Fetch user's bookings
    useEffect(() => {
        if (!user?.uid) {
            console.log("No user UID found");
            setLoading(false);
            return;
        }

        console.log("Attempting to fetch bookings for user:", user.uid);
        setLoading(true);

        try {
            // Create a query to get bookings for the current user
            const bookingsQuery = query(
                collection(db, 'bookings'),
                where('userId', '==', user.uid)
                // Removed orderBy temporarily to debug the query
            );

            console.log("Query created, setting up snapshot listener");

            // Use onSnapshot for real-time updates
            const unsubscribe = onSnapshot(
                bookingsQuery,
                (snapshot) => {
                    console.log("Snapshot received with", snapshot.docs.length, "documents");
                    const bookingsList = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        // Ensure paymentStatus is always defined
                        paymentStatus: doc.data().paymentStatus || 'unpaid'
                    }));

                    console.log("Processed bookings:", bookingsList);
                    setBookings(bookingsList);
                    setLoading(false);
                },
                (error) => {
                    console.error('Error fetching bookings:', error);
                    toast.error('Error loading your bookings: ' + error.message);
                    setLoading(false);
                }
            );

            return () => unsubscribe();
        } catch (err) {
            console.error("Error setting up bookings listener:", err);
            setLoading(false);
        }
    }, [user, db]);

    // Extract unique locations for filter dropdowns
    const uniqueCities = useMemo(() => {
        const cities = [...new Set(bookings.map(b => b.city).filter(Boolean))];
        return cities.sort();
    }, [bookings]);

    const uniqueCountries = useMemo(() => {
        const countries = [...new Set(bookings.map(b => b.country).filter(Boolean))];
        return countries.sort();
    }, [bookings]);

    // Calculate total credit from unpaid bookings only
    const totalCredit = useMemo(() => {
        const total = bookings.reduce((sum, booking) => {
            // Only include unpaid bookings in the total
            // Ensure we're handling string and number totalAmount values
            if (booking.paymentStatus === 'unpaid' || !booking.paymentStatus) {
                const amount = typeof booking.totalAmount === 'string'
                    ? parseFloat(booking.totalAmount)
                    : Number(booking.totalAmount) || 0;

                return sum + amount;
            }
            return sum;
        }, 0);

        console.log('Total credit calculation:', total);
        return total;
    }, [bookings]);

    // Function to format currency
    const formatCurrency = (amount) => {
        return `$${Number(amount).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    };

    // Format package type for display
    const formatPackageType = (type) => {
        if (type === '4hr40km') return '4 Hours / 40 KM';
        if (type === '8hr80km') return '8 Hours / 80 KM';
        if (type === 'airport') return 'Airport Transfer';
        return type;
    };

    // Function to toggle sort direction
    const handleSortClick = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Handle payment button click
    const handlePaymentButtonClick = (booking) => {
        console.log('Payment button clicked for booking:', booking);

        // First set the selected booking
        setSelectedBooking(booking);

        // Then determine modal mode
        if (booking.paymentStatus === 'unpaid' || !booking.paymentStatus) {
            setModalMode('payment');
        } else {
            setModalMode('contact');
        }

        // Use setTimeout to ensure state updates before showing modal
        setTimeout(() => {
            console.log("Showing bank modal for", booking.id);
            setShowBankModal(true);
        }, 50);
    };

    // Handle booking status update from modal
    const handleBookingStatusUpdate = (updatedBooking) => {
        // This isn't strictly necessary with onSnapshot, but keeping it for safety
        setBookings(prevBookings =>
            prevBookings.map(booking =>
                booking.id === updatedBooking.id ? updatedBooking : booking
            )
        );
    };

    // Filter and sort bookings
    const filteredAndSortedBookings = useMemo(() => {
        console.log('Filtering and sorting bookings:', bookings.length);

        // First apply filters
        let result = [...bookings];

        if (filterCity) {
            result = result.filter(b => b.city === filterCity);
        }

        if (filterCountry) {
            result = result.filter(b => b.country === filterCountry);
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(b =>
                (b.userName && b.userName.toLowerCase().includes(query)) ||
                (b.travelerName && b.travelerName.toLowerCase().includes(query)) ||
                (b.userEmail && b.userEmail.toLowerCase().includes(query)) ||
                (b.pickupLocation && b.pickupLocation.toLowerCase().includes(query)) ||
                (b.dropoffLocation && b.dropoffLocation.toLowerCase().includes(query)) ||
                (b.companyName && b.companyName.toLowerCase().includes(query))
            );
        }

        // Then sort
        return result.sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            // Handle timestamps for date sorting
            if (sortField === 'createdAt' && a.createdAt && b.createdAt) {
                if (a.createdAt.toDate && b.createdAt.toDate) {
                    aValue = a.createdAt.toDate();
                    bValue = b.createdAt.toDate();
                } else {
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                }
            }

            if (aValue === bValue) return 0;

            if (sortDirection === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
        });
    }, [bookings, sortField, sortDirection, filterCity, filterCountry, searchQuery]);

    // Render sort indicator
    const renderSortIndicator = (field) => {
        if (sortField !== field) return null;

        return sortDirection === 'asc'
            ? <ArrowUpAZ size={14} className="ml-1 inline" />
            : <ArrowDownAZ size={14} className="ml-1 inline" />;
    };

    // Render payment status badge with appropriate styling
    const renderPaymentStatus = (status) => {
        switch (status) {
            case 'paid':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center gap-1">
                        <CheckCircle size={12} /> Paid
                    </span>
                );
            case 'marked_done':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 flex items-center gap-1">
                        <CheckCircle size={12} /> Marked as Done
                    </span>
                );
            case 'marked_not_received':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1">
                        <AlertTriangle size={12} /> Marked but Not Received
                    </span>
                );
            case 'under_review':
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 flex items-center gap-1">
                        <Clock size={12} /> Under Review
                    </span>
                );
            default:
                return (
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 flex items-center gap-1">
                        <Ban size={12} /> Unpaid
                    </span>
                );
        }
    };

    // Render payment action button based on status
    const renderActionButton = (booking) => {
        // Default to unpaid if status is missing
        const status = booking.paymentStatus || 'unpaid';

        switch (status) {
            case 'paid':
                return (
                    <button disabled className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-700 opacity-70 cursor-not-allowed flex items-center">
                        <CheckCircle size={14} className="mr-1" /> Payment Completed
                    </button>
                );
            case 'marked_done':
                return (
                    <button disabled className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-50 text-green-600 opacity-70 cursor-not-allowed flex items-center">
                        <Clock size={14} className="mr-1" /> Waiting for Confirmation
                    </button>
                );
            case 'marked_not_received':
            case 'under_review':
                return (
                    <button
                        onClick={() => handlePaymentButtonClick(booking)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-100 text-yellow-700 hover:bg-yellow-200 flex items-center"
                    >
                        <AlertTriangle size={14} className="mr-1" /> Contact Support
                    </button>
                );
            default:
                return (
                    <button
                        onClick={() => handlePaymentButtonClick(booking)}
                        className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary/10 text-primary hover:bg-primary/20 flex items-center"
                    >
                        <CreditCard size={14} className="mr-1" /> Make Payment
                    </button>
                );
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-4 flex items-center justify-center h-[70vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto pt-32 pb-20 max-w-7xl px-4">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-primary mb-2">My Bookings</h1>
                        <p className="text-gray-600">Manage your bookings and payments.</p>
                    </div>
                    <div className="bg-primary/10 p-4 rounded-lg">
                        <p className="text-sm text-primary font-medium">Total Outstanding</p>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(totalCredit)}</p>
                    </div>
                </div>

                {/* Filters and Sorting Controls */}
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Search Bookings</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search by location, flight number..."
                                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                                />
                                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                            </div>
                        </div>

                        <div className="w-full md:w-64">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Filter by City</label>
                            <select
                                value={filterCity}
                                onChange={(e) => setFilterCity(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-primary focus:border-primary"
                            >
                                <option value="">All Cities</option>
                                {uniqueCities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full md:w-64">
                            <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Country</label>
                            <select
                                value={filterCountry}
                                onChange={(e) => setFilterCountry(e.target.value)}
                                className="w-full p-2 border rounded-lg focus:ring-primary focus:border-primary"
                            >
                                <option value="">All Countries</option>
                                {uniqueCountries.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => handleSortClick('createdAt')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${sortField === 'createdAt' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            <Calendar size={14} className="mr-1" />
                            Date {renderSortIndicator('createdAt')}
                        </button>

                        <button
                            onClick={() => handleSortClick('totalAmount')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${sortField === 'totalAmount' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            <DollarSign size={14} className="mr-1" />
                            Amount {renderSortIndicator('totalAmount')}
                        </button>

                        <button
                            onClick={() => handleSortClick('city')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${sortField === 'city' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                        >
                            <MapPin size={14} className="mr-1" />
                            City {renderSortIndicator('city')}
                        </button>

                        <button
                            onClick={() => {
                                setFilterCity('');
                                setFilterCountry('');
                                setSearchQuery('');
                                setSortField('createdAt');
                                setSortDirection('desc');
                            }}
                            className="px-3 py-1.5 text-xs font-medium rounded-full bg-red-50 text-red-600 hover:bg-red-100 flex items-center"
                        >
                            <RefreshCw size={14} className="mr-1" />
                            Reset Filters
                        </button>
                    </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-gray-600 mb-4">
                    Showing {filteredAndSortedBookings.length} of {bookings.length} bookings
                </div>

                {/* Table */}
                <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                    {filteredAndSortedBookings.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            You don't have any bookings yet. <a href="/book" className="text-primary hover:underline">Book a ride</a>.
                        </div>
                    ) : (
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-background sticky top-0">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Booking ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Time</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Pickup</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Dropoff</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">City</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Packages</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Payment Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredAndSortedBookings.map(booking => (
                                    <tr key={booking.id} className="hover:bg-background/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-primary font-bold">#{booking.id.slice(-6).toUpperCase()}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{booking.travelDate}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{booking.travelTime}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{booking.pickupLocation}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{booking.dropoffLocation}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">{booking.city}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {Array.isArray(booking.packages) && booking.packages.length > 0 ? (
                                                <div className="space-y-1">
                                                    {booking.packages.map((pkg, idx) => (
                                                        <div key={idx} className="text-xs">
                                                            <span className="font-medium">{pkg.model}</span> - {formatPackageType(pkg.packageType)}
                                                            {pkg.quantity > 1 && <span className="ml-1 text-primary">(x{pkg.quantity})</span>}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="text-xs text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap font-bold text-primary">
                                            {formatCurrency(booking.totalAmount)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {renderPaymentStatus(booking.paymentStatus)}
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {renderActionButton(booking)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Bank Details Modal */}
            <BankDetailsModal
                isOpen={showBankModal}
                onClose={() => setShowBankModal(false)}
                booking={selectedBooking}
                mode={modalMode}
                onStatusUpdate={handleBookingStatusUpdate}
            />
        </div>
    );
};

export default UserDashboard;