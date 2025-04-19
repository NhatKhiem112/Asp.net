import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Save, ArrowLeft, AlertCircle } from 'react-feather';
import UsersService, { CreateUserData, UpdateUserData } from '../../services/users.service';
import AdminLayout from '../../layouts/AdminLayout';

const UserFormPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;
    const navigate = useNavigate();

    const [formData, setFormData] = useState<CreateUserData | UpdateUserData>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'User',
    });

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    useEffect(() => {
        if (isEditMode) {
            fetchUserData();
        }
    }, [id]);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            const userData = await UsersService.getUser(parseInt(id as string));
            // Remove password field in edit mode
            const { password, ...userDataWithoutPassword } = formData;
            setFormData({
                ...userDataWithoutPassword,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                role: userData.role,
            });
            setLoading(false);
        } catch (err) {
            setError('Failed to load user data. Please try again.');
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Mark field as touched
        if (!touched[name]) {
            setTouched({
                ...touched,
                [name]: true,
            });
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name } = e.target;
        setTouched({
            ...touched,
            [name]: true,
        });
    };

    const validate = (): boolean => {
        // Mark all fields as touched
        const allTouched = Object.keys(formData).reduce(
            (acc, key) => ({ ...acc, [key]: true }),
            {}
        );
        setTouched(allTouched);

        // Validate required fields (except password in edit mode)
        if (!formData.firstName || !formData.lastName || !formData.email) {
            setError('Please fill in all required fields');
            return false;
        }

        // Validate password in create mode
        if (!isEditMode && !formData.password) {
            setError('Password is required when creating a new user');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email as string)) {
            setError('Please enter a valid email address');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setSubmitting(true);
            setError('');

            if (isEditMode) {
                // In edit mode: remove empty fields and password if not changed
                const formDataToSubmit: UpdateUserData = {};
                Object.entries(formData).forEach(([key, value]) => {
                    if (value !== '' && key !== 'password') {
                        (formDataToSubmit as any)[key] = value;
                    }
                });

                // Only include password if it was provided
                if (formData.password && formData.password.trim() !== '') {
                    formDataToSubmit.password = formData.password;
                }

                await UsersService.updateUser(parseInt(id as string), formDataToSubmit);
                setSuccess('User updated successfully');
            } else {
                // In create mode: use all fields
                await UsersService.createUser(formData as CreateUserData);
                setSuccess('User created successfully');
                // Clear form after successful creation
                setFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    password: '',
                    phoneNumber: '',
                    role: 'User',
                });
            }

            setSubmitting(false);

            // Navigate back to users list after a short delay
            setTimeout(() => {
                navigate('/admin/users');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error saving user data');
            setSubmitting(false);
        }
    };

    return (
        <AdminLayout title={isEditMode ? 'Edit User' : 'Add New User'}>
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center text-indigo-600 hover:text-indigo-800"
                >
                    <ArrowLeft size={16} className="mr-1" /> Back to Users
                </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center mb-6">
                    <User size={24} className="text-indigo-600 mr-2" />
                    <h1 className="text-2xl font-semibold text-gray-800">
                        {isEditMode ? 'Edit User' : 'Add New User'}
                    </h1>
                </div>

                {error && (
                    <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md flex items-center">
                        <AlertCircle size={18} className="mr-2" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md">
                        {success}
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-10">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mx-auto"></div>
                        <p className="mt-3 text-gray-600">Loading user data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`block w-full p-2 border ${touched.firstName && !formData.firstName
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    required
                                />
                                {touched.firstName && !formData.firstName && (
                                    <p className="mt-1 text-sm text-red-600">First name is required</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`block w-full p-2 border ${touched.lastName && !formData.lastName
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    required
                                />
                                {touched.lastName && !formData.lastName && (
                                    <p className="mt-1 text-sm text-red-600">Last name is required</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`block w-full p-2 border ${touched.email && (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email as string))
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    required
                                />
                                {touched.email && !formData.email && (
                                    <p className="mt-1 text-sm text-red-600">Email is required</p>
                                )}
                                {touched.email && formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email as string) && (
                                    <p className="mt-1 text-sm text-red-600">Please enter a valid email</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password {!isEditMode && <span className="text-red-500">*</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password || ''}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                    className={`block w-full p-2 border ${touched.password && !formData.password && !isEditMode
                                            ? 'border-red-500'
                                            : 'border-gray-300'
                                        } rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                                    required={!isEditMode}
                                    placeholder={isEditMode ? 'Leave blank to keep current password' : ''}
                                />
                                {touched.password && !formData.password && !isEditMode && (
                                    <p className="mt-1 text-sm text-red-600">Password is required</p>
                                )}
                                {isEditMode && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Leave blank to keep the current password
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/users')}
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                            >
                                {submitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} className="mr-2" />
                                        {isEditMode ? 'Update User' : 'Create User'}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </AdminLayout>
    );
};

export default UserFormPage; 