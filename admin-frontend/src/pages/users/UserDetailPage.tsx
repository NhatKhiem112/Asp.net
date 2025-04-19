import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { User, Edit, Trash2, ArrowLeft, AlertCircle, Calendar, Mail, Phone, Tag } from 'react-feather';
import UsersService from '../../services/users.service';
import AdminLayout from '../../layouts/AdminLayout';

const UserDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userData = await UsersService.getUser(parseInt(id as string));
            setUser(userData);
            setLoading(false);
        } catch (err) {
            setError('Failed to load user data. Please try again.');
            setLoading(false);
        }
    };

    const handleDeleteClick = () => {
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        try {
            await UsersService.deleteUser(parseInt(id as string));
            navigate('/admin/users');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error deleting user');
            setDeleteModalOpen(false);
        }
    };

    return (
        <AdminLayout title="User Details">
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Users
                </button>
            </div>

            {error && (
                <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                    <AlertCircle size={18} className="mr-2" />
                    {error}
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 bg-white rounded-lg shadow">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-3 text-gray-600">Loading user data...</p>
                </div>
            ) : user ? (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <div className="flex items-center">
                            <div className="bg-indigo-100 p-3 rounded-full">
                                <User size={24} className="text-indigo-600" />
                            </div>
                            <div className="ml-4">
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {user.firstName} {user.lastName}
                                </h1>
                                <p className="text-sm text-gray-500">User ID: {user.id}</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Link
                                to={`/admin/users/edit/${user.id}`}
                                className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
                            >
                                <Edit size={16} className="mr-1" /> Edit
                            </Link>
                            <button
                                onClick={handleDeleteClick}
                                className="flex items-center px-3 py-2 bg-red-50 text-red-700 rounded-md hover:bg-red-100"
                            >
                                <Trash2 size={16} className="mr-1" /> Delete
                            </button>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">User Information</h2>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <Mail className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Email Address</p>
                                            <p className="text-gray-800">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Phone className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Phone Number</p>
                                            <p className="text-gray-800">{user.phoneNumber || 'Not provided'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Tag className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Role</p>
                                            <p>
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'Admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                        <div>
                                            <p className="text-sm text-gray-500">Created At</p>
                                            <p className="text-gray-800">
                                                {new Date(user.createdAt).toLocaleDateString()} {new Date(user.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>

                                    {user.updatedAt && (
                                        <div className="flex items-start">
                                            <Calendar className="w-5 h-5 text-gray-500 mt-0.5 mr-3" />
                                            <div>
                                                <p className="text-sm text-gray-500">Last Updated</p>
                                                <p className="text-gray-800">
                                                    {new Date(user.updatedAt).toLocaleDateString()} {new Date(user.updatedAt).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h2 className="text-lg font-semibold text-gray-800 mb-4">Booking History</h2>

                                {user.bookings && user.bookings.length > 0 ? (
                                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                                        <table className="min-w-full divide-y divide-gray-300">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Booking ID</th>
                                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Date</th>
                                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200 bg-white">
                                                {user.bookings.map((booking: any) => (
                                                    <tr key={booking.id}>
                                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                                                            {booking.id}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                            {new Date(booking.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                            <span
                                                                className={`px-2 py-1 text-xs font-semibold rounded-full ${booking.bookingStatus === 'Confirmed'
                                                                        ? 'bg-green-100 text-green-800'
                                                                        : booking.bookingStatus === 'Cancelled'
                                                                            ? 'bg-red-100 text-red-800'
                                                                            : 'bg-yellow-100 text-yellow-800'
                                                                    }`}
                                                            >
                                                                {booking.bookingStatus}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 p-4 rounded-md text-gray-500 text-center">
                                        No booking history available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center">
                    <div className="text-red-500 mb-2">
                        <AlertCircle size={48} className="inline-block" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">User Not Found</h3>
                    <p className="mt-1 text-gray-500">The user you are looking for does not exist or may have been deleted.</p>
                    <div className="mt-6">
                        <Link
                            to="/admin/users"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Back to User List
                        </Link>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
                        <p className="mb-6 text-gray-600">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default UserDetailPage; 