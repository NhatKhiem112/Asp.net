import React from 'react';
import { Bell, Search, User } from 'react-feather';
import AuthService from '../../services/auth.service';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for redirection

interface HeaderProps {
    sidebarWidth?: string;
    title?: string;
}

const Header: React.FC<HeaderProps> = ({ sidebarWidth, title = 'Dashboard' }) => {
    const user = AuthService.getCurrentUser();
    const navigate = useNavigate(); // Initialize useNavigate

    const handleLogout = () => {
        AuthService.logout(); // Call the logout method
        navigate('/admin/login'); // Redirect to the login page after logout
    };

    return (
        <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center px-6" style={{ marginLeft: sidebarWidth }}>
            <div className="flex-1 flex items-center">
                <h1 className="text-xl font-bold text-gray-800 mr-6">{title}</h1>
                <div className="relative w-64">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full rounded-md border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            <div className="flex items-center space-x-4">
                <button className="relative p-2 rounded-full hover:bg-gray-100">
                    <Bell size={20} className="text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="flex items-center">
                    <div className="mr-3 text-right">
                        <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <User size={20} className="text-indigo-600" />
                    </div>
                </div>

                {/* Logout Button */}
                <button onClick={handleLogout} className="text-red-600 hover:text-red-800">
                    Logout
                </button>
            </div>
        </header>
    );
};

export default Header;