import { useState } from 'react';
import { Mail, User, CheckCircle, Clock, XCircle, Search, RefreshCw, UserPlus, ShieldAlert, Lock } from 'lucide-react';
import UserCredentialsModal from './UserCredentialsModal';

const UserManagementTab = ({ users, handlePasswordAssign, updateUserStatus }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [credentialsModal, setCredentialsModal] = useState({ isOpen: false, userId: null, userEmail: null });

    // Filter users based on search query and status filter
    const filteredUsers = users.filter(user => {
        const matchesSearch = 
            !searchQuery || 
            (user.fullName && user.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (user.phone && user.phone.includes(searchQuery));
            
        const matchesStatus = 
            filterStatus === 'all' || 
            user.status === filterStatus;
            
        return matchesSearch && matchesStatus;
    });
    
    const openCredentialsModal = (user) => {
        setCredentialsModal({
            isOpen: true,
            userId: user.id,
            userEmail: user.email
        });
    };

    const closeCredentialsModal = () => {
        setCredentialsModal({ isOpen: false, userId: null, userEmail: null });
    };

    return (
        <div className="space-y-4">
            {/* Search and Filter Controls */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Search Users</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name, email, phone..."
                                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>
                    
                    <div className="w-full md:w-64">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Filter by Status</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full p-2 border rounded-lg focus:ring-primary focus:border-primary"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                    
                    <div className="w-full md:w-auto flex items-end">
                        <button 
                            onClick={() => {
                                setSearchQuery('');
                                setFilterStatus('all');
                            }}
                            className="mt-auto w-full md:w-auto px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center"
                        >
                            <RefreshCw size={14} className="mr-1" />
                            Reset Filters
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
            </div>
            
            {/* User Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-background">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Contact</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                    No users match your search criteria
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-background/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10 bg-accent rounded-full flex items-center justify-center text-white">
                                                <User size={18} />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-text">{user.fullName || user.name || 'No Name'}</div>
                                                <div className="text-sm text-gray-500">ID: {user.id.substring(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-text flex items-center">
                                            <Mail size={14} className="mr-1" /> {user.email || 'No email'}
                                        </div>
                                        <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex items-center text-xs leading-5 font-semibold rounded-full 
                                        ${user.status === 'approved' 
                                            ? 'bg-green-100 text-green-800' 
                                            : user.status === 'pending' 
                                                ? 'bg-yellow-100 text-yellow-800' 
                                                : 'bg-red-100 text-red-800'}`}>
                                            {user.status === 'approved' && <CheckCircle size={14} className="mr-1" />}
                                            {user.status === 'pending' && <Clock size={14} className="mr-1" />}
                                            {user.status === 'rejected' && <XCircle size={14} className="mr-1" />}
                                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                        </span>
                                        {user.hasAuthAccount && (
                                            <div className="mt-1 text-xs text-primary">
                                                <CheckCircle size={12} className="inline mr-1" /> Firebase Auth Account
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex flex-wrap gap-2">
                                            {/* Only show one of these buttons based on user state */}
                                            {user.status === 'pending' && (
                                                <button 
                                                    onClick={() => handlePasswordAssign(user)}
                                                    className="px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors flex items-center">
                                                    <UserPlus size={16} className="mr-1" /> Create Account & Approve
                                                </button>
                                            )}
                                            
                                            {/* Only show reject for non-rejected users */}
                                            {user.status !== 'rejected' && (
                                                <button 
                                                    onClick={() => updateUserStatus(user.id, 'rejected')}
                                                    className="px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center">
                                                    <ShieldAlert size={16} className="mr-1" /> Reject
                                                </button>
                                            )}
                                            
                                            {/* For rejected users, allow re-approving them */}
                                            {user.status === 'rejected' && (
                                                <button 
                                                    onClick={() => updateUserStatus(user.id, 'approved')}
                                                    className="px-3 py-1 bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors flex items-center">
                                                    <CheckCircle size={16} className="mr-1" /> Reactivate
                                                </button>
                                            )}

                                            {/* Change Email/Password button for approved users with auth accounts */}
                                            {user.status === 'approved' && user.hasAuthAccount && (
                                                <button 
                                                    onClick={() => openCredentialsModal(user)}
                                                    className="px-3 py-1 bg-primary/10 text-primary rounded-md hover:bg-primary/20 transition-colors flex items-center">
                                                    <Lock size={16} className="mr-1" /> Change Email/Password
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Credentials Modal */}
            {credentialsModal.isOpen && (
                <UserCredentialsModal
                    isOpen={credentialsModal.isOpen}
                    onClose={closeCredentialsModal}
                    userId={credentialsModal.userId}
                    userEmail={credentialsModal.userEmail}
                />
            )}
        </div>
    );
};

export default UserManagementTab;