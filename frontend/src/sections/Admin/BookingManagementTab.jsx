import { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, DollarSign, Car, CheckCircle, Filter, ArrowDownAZ, ArrowUpAZ, ArrowDownUp, Search, Users, RefreshCw } from 'lucide-react';

const BookingManagementTab = ({ bookings }) => {
  // State for sorting and filtering
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [filterCity, setFilterCity] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Helper function to format package type
  const formatPackageType = (type) => {
    if (type === '4hr40km') return '4 Hours / 40 KM';
    if (type === '8hr80km') return '8 Hours / 80 KM';
    if (type === 'airport') return 'Airport Transfer';
    return type;
  };

  // Extract unique locations for filter dropdowns
  const uniqueCities = useMemo(() => {
    const cities = [...new Set(bookings.map(b => b.city).filter(Boolean))];
    return cities.sort();
  }, [bookings]);

  const uniqueCountries = useMemo(() => {
    const countries = [...new Set(bookings.map(b => b.country).filter(Boolean))];
    return countries.sort();
  }, [bookings]);

  // Function to format currency based on user's locale
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
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

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
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
          aValue = a.createdAt.toDate().getTime();
          bValue = b.createdAt.toDate().getTime();
        } else {
          // Fallback if not a Firestore timestamp
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
        }
      }
      
      // Handle numeric fields
      if (sortField === 'totalAmount' || sortField === 'travelers' || sortField === 'vehicles') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }
      
      // Handle string fields
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortDirection === 'asc') {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      }
      
      // Default comparison
      if (sortDirection === 'asc') {
        return aValue - bValue;
      }
      return bValue - aValue;
    });
  }, [bookings, sortField, sortDirection, filterCity, filterCountry, searchQuery]);

  // Render sort indicator
  const renderSortIndicator = (field) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' 
      ? <ArrowUpAZ size={14} className="ml-1 inline" /> 
      : <ArrowDownAZ size={14} className="ml-1 inline" />;
  };

  return (
    <div className="space-y-4">
      {/* Filters and Sorting Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Search Bookings</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, email, location..."
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
            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${
              sortField === 'createdAt' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Calendar size={14} className="mr-1" />
            Date {renderSortIndicator('createdAt')}
          </button>
          
          <button 
            onClick={() => handleSortClick('totalAmount')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${
              sortField === 'totalAmount' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <DollarSign size={14} className="mr-1" />
            Amount {renderSortIndicator('totalAmount')}
          </button>
          
          <button 
            onClick={() => handleSortClick('city')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${
              sortField === 'city' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <MapPin size={14} className="mr-1" />
            City {renderSortIndicator('city')}
          </button>
          
          <button 
            onClick={() => handleSortClick('travelers')}
            className={`px-3 py-1.5 text-xs font-medium rounded-full flex items-center ${
              sortField === 'travelers' ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Users size={14} className="mr-1" />
            Travelers {renderSortIndicator('travelers')}
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
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedBookings.length} of {bookings.length} bookings
      </div>
      
      {/* Table */}
      <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <table className="min-w-[1200px] divide-y divide-gray-200">
          <thead className="bg-background sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Booking ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">User Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Company</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">User Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">User Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Traveler Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Traveler Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Traveler Phone</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Travelers</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Vehicles</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Pickup</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Dropoff</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">City</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">State</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Country</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Special Req.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Packages</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Total Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Payment Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Payment Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider whitespace-nowrap">Created At</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedBookings.length === 0 ? (
              <tr>
                <td colSpan="24" className="px-4 py-8 text-center text-gray-500">
                  No bookings match your search criteria
                </td>
              </tr>
            ) : (
              filteredAndSortedBookings.map(booking => (
                <tr key={booking.id} className="hover:bg-background/50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-primary font-bold">#{booking.id.slice(-6).toUpperCase()}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.userName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.companyName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.userEmail}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.userPhone}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.travelerName}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.travelerEmail}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.travelerPhone}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.travelers}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.vehicles}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.travelDate}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.travelTime}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.pickupLocation}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.dropoffLocation}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.city}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.state}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{booking.country}</td>
                  <td className="px-4 py-3 whitespace-nowrap max-w-[200px] truncate" title={booking.specialRequirements}>{booking.specialRequirements}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {Array.isArray(booking.packages) && booking.packages.length > 0 ? (
                      <div className="space-y-1">
                        {booking.packages.map((pkg, idx) => (
                          <div key={idx} className="text-xs">
                            <span className="font-medium">{pkg.model}</span> - {formatPackageType(pkg.packageType)}
                            {pkg.quantity > 1 && <span className="ml-1 text-primary">(x{pkg.quantity})</span>}
                            <span className="ml-2 text-gray-500">
                              {formatCurrency(pkg.price)} x {pkg.quantity} = 
                              <span className="font-bold text-primary ml-1">
                                {formatCurrency(pkg.totalPrice)}
                              </span>
                            </span>
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
                  <td className="px-4 py-3 whitespace-nowrap">{booking.paymentMethod}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${booking.paymentStatus === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : booking.paymentStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                      {booking.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold
                      ${booking.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-700'
                        : booking.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-xs">
                    {booking.createdAt && booking.createdAt.toDate
                      ? booking.createdAt.toDate().toLocaleString()
                      : booking.createdAt ? new Date(booking.createdAt).toLocaleString() : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookingManagementTab;