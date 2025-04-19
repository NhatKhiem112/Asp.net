import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

const ChangePasswordPage: React.FC = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateForm = () => {
        if (!formData.currentPassword) {
            setError('Current password is required');
            return false;
        }
        if (!formData.newPassword) {
            setError('New password is required');
            return false;
        }
        if (formData.newPassword.length < 6) {
            setError('New password must be at least 6 characters long');
            return false;
        }
        if (formData.newPassword !== formData.confirmNewPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setIsSaving(true);

        try {
            // Call the actual API to change the password
            await AuthService.changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
                confirmNewPassword: formData.confirmNewPassword
            });

            setSuccess('Password successfully changed!');

            // Clear form
            setFormData({
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: ''
            });

            // Navigate back to profile after a short delay
            setTimeout(() => {
                navigate('/profile');
            }, 1500);
        } catch (error: any) {
            console.error('Error changing password:', error);
            setError(error.response?.data || 'Failed to change password. Please check your current password and try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark text-white py-10 px-4">
            <div className="max-w-lg mx-auto bg-secondary rounded-lg shadow-lg p-8">
                <div className="flex items-center mb-6">
                    <Link
                        to="/profile"
                        className="mr-4 text-gray-400 hover:text-white"
                    >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                    </Link>
                    <h1 className="text-2xl font-bold">Change Password</h1>
                </div>

                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-white px-4 py-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-900/50 border border-green-500 text-white px-4 py-3 rounded-md mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={formData.currentPassword}
                            onChange={handleChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter your current password"
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Enter your new password"
                            required
                            minLength={6}
                        />
                        <p className="text-sm text-gray-400 mt-1">Password must be at least 6 characters</p>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            id="confirmNewPassword"
                            name="confirmNewPassword"
                            value={formData.confirmNewPassword}
                            onChange={handleChange}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            placeholder="Confirm your new password"
                            required
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Link
                            to="/profile"
                            className="px-4 py-2 border border-gray-600 rounded-md text-white hover:bg-gray-700 transition"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {isSaving ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </span>
                            ) : 'Change Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordPage; 