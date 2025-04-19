import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Eye, Edit, Trash2, Search, Plus, AlertCircle } from 'react-feather';
import UsersService from '../../services/users.service';
import AdminLayout from '../../layouts/AdminLayout';

const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await UsersService.getUsers(search, page, pageSize);
            setUsers(data.users);
            setTotalPages(data.totalPages);
            setTotalUsers(data.total);
            setLoading(false);
        } catch (err) {
            setError('Failed to load users. Please try again later.');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [page, pageSize, search]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1); // Reset to first page when searching
    };

    const handleDeleteClick = (userId: number) => {
        setUserToDelete(userId);
        setDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (userToDelete) {
            try {
                await UsersService.deleteUser(userToDelete);
                fetchUsers(); // Refresh the list
                setDeleteModalOpen(false);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Error deleting user');
            }
        }
    };

    const renderPagination = () => {
        const pages = [];
        const displayPages = 5; // Number of page buttons to show

        let startPage = Math.max(1, page - Math.floor(displayPages / 2));
        let endPage = Math.min(totalPages, startPage + displayPages - 1);

        if (endPage - startPage + 1 < displayPages) {
            startPage = Math.max(1, endPage - displayPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`px-3 py-1 mx-1 rounded ${page === i
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                >
                    {i}
                </button>
            );
        }

        return (
            <div className="flex items-center justify-between mt-6">
                <div>
                    <span className="text-sm text-gray-700">
                        Showing <span className="font-medium">{users.length}</span> of{' '}
                        <span className="font-medium">{totalUsers}</span> users
                    </span>
                </div>
                <div className="flex">
                    <button
                        onClick={() => setPage(page > 1 ? page - 1 : 1)}
                        disabled={page <= 1}
                        className={`px-3 py-1 mx-1 rounded ${page <= 1
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Previous
                    </button>
                    {pages}
                    <button
                        onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
                        disabled={page >= totalPages}
                        className={`px-3 py-1 mx-1 rounded ${page >= totalPages
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                    >
                        Next
                    </button>
                </div>
            </div>
        );
    };

    return (
        <AdminLayout title="User Management">
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-semibold text-gray-800 flex items-center">
                        <User className="mr-2" size={24} />
                        User Management
                    </h1>
                    <Link
                        to="/admin/users/add"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-indigo-700 transition duration-200"
                    >
                        <Plus size={18} className="mr-1" /> Add New User
                    </Link>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                        <AlertCircle size={18} className="mr-2" />
                        {error}
                    </div>
                )}

                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-3 text-gray-600">Loading users...</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Phone
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.length > 0 ? (
                                        users.map((user) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {user.id}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.firstName} {user.lastName}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.email}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.phoneNumber}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <span
                                                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'Admin'
                                                                ? 'bg-purple-100 text-purple-800'
                                                                : 'bg-green-100 text-green-800'
                                                            }`}
                                                    >
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <Link
                                                        to={`/admin/users/${user.id}`}
                                                        className="text-indigo-600 hover:text-indigo-900 mx-2"
                                                        title="View details"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <Link
                                                        to={`/admin/users/edit/${user.id}`}
                                                        className="text-blue-600 hover:text-blue-900 mx-2"
                                                        title="Edit user"
                                                    >
                                                        <Edit size={18} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDeleteClick(user.id)}
                                                        className="text-red-600 hover:text-red-900 mx-2"
                                                        title="Delete user"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                                No users found. Try a different search term.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {renderPagination()}
                    </>
                )}
            </div>

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

export default UsersPage; 