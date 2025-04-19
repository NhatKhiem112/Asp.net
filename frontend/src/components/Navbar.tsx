import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';

// Custom component để tự động đóng menu khi click
const ProfileMenuItem: React.FC<{
    to: string;
    onClick?: () => void;
    children: React.ReactNode;
}> = ({ to, onClick, children }) => {
    const navigate = useNavigate();
    
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        if (onClick) onClick();
        navigate(to);
    };
    
    return (
        <a
            href={to}
            onClick={handleClick}
            className="flex items-center px-4 py-2 text-sm hover:bg-primary hover:text-white"
            role="menuitem"
        >
            {children}
        </a>
    );
};

const Navbar: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Check login status and get user data on component mount and when location changes
        const checkLoginStatus = async () => {
            setIsLoggedIn(AuthService.isLoggedIn());
            try {
                if (AuthService.isLoggedIn()) {
                    // Thử lấy dữ liệu từ API trước
                    const apiUserData = await AuthService.fetchCurrentUser();

                    if (apiUserData) {
                        setCurrentUser(apiUserData);
                    } else {
                        // Sử dụng dữ liệu từ localStorage nếu API thất bại
                        const localUserData = AuthService.getCurrentUser();
                        setCurrentUser(localUserData);
                    }
                }
            } catch (error) {
                console.error('Error getting current user:', error);
                // Sử dụng dữ liệu từ localStorage nếu API thất bại
                const localUserData = AuthService.getCurrentUser();
                setCurrentUser(localUserData);
            }
        };

        checkLoginStatus();

        // Close the profile menu when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [location]); // Re-run when location changes, which happens after login redirect

    const handleLogout = () => {
        setIsProfileMenuOpen(false); // Đóng menu khi đăng xuất
        AuthService.logout();
        setIsLoggedIn(false);
        setCurrentUser(null);
        navigate('/login');
    };

    const toggleProfileMenu = () => {
        setIsProfileMenuOpen(!isProfileMenuOpen);
    };

    // Hàm xử lý khi click vào một menu item
    const handleMenuItemClick = (path: string) => {
        setIsProfileMenuOpen(false); // Đóng menu khi click
        navigate(path);
    };

    // Hàm lấy avatar từ nhiều thuộc tính có thể có
    const getUserAvatar = (user: any): string => {
        if (!user) return 'https://via.placeholder.com/150';
        
        return user.avatarUrl || 
               user.profileImage || 
               user.photoURL || 
               user.imageUrl || 
               'https://via.placeholder.com/150';
    };

    return (
        <nav className="bg-secondary shadow-md">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-primary focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            aria-controls="mobile-menu"
                            aria-expanded="false"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Hamburger icon */}
                            <svg
                                className="block h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 flex items-center justify-center sm:items-stretch sm:justify-start">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl font-bold text-primary">
                                CineTicket
                            </Link>
                        </div>
                        <div className="hidden sm:block sm:ml-6">
                            <div className="flex space-x-4">
                                <Link
                                    to="/"
                                    className="text-gray-300 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Home
                                </Link>
                                <Link
                                    to="/movies"
                                    className="text-gray-300 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Movies
                                </Link>
                                <Link
                                    to="/cinemas"
                                    className="text-gray-300 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                                >
                                    Cinemas
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                        {isLoggedIn ? (
                            <div className="flex items-center relative" ref={profileMenuRef}>
                                <button
                                    onClick={toggleProfileMenu}
                                    className="text-white rounded-md flex items-center focus:outline-none"
                                >
                                    <div className="h-8 w-8 rounded-full overflow-hidden border-2 border-gray-600">
                                        <img 
                                            src={getUserAvatar(currentUser)}
                                            alt="Avatar"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                </button>

                                {/* Profile Dropdown Menu */}
                                {isProfileMenuOpen && (
                                    <div className="absolute right-0 mt-2 top-full w-56 rounded-md shadow-lg bg-dark ring-1 ring-black ring-opacity-5 z-50 py-1">
                                        <div className="py-1 bg-secondary rounded-md text-gray-300" role="menu" aria-orientation="vertical" aria-labelledby="user-menu">
                                            <div className="px-4 py-2 border-b border-gray-700">
                                                <p className="text-sm font-medium text-white">
                                                    {currentUser?.firstName && currentUser?.lastName
                                                        ? `${currentUser.firstName} ${currentUser.lastName}`
                                                        : currentUser?.email || 'User'}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">{currentUser?.email}</p>
                                            </div>
                                            
                                            <ProfileMenuItem 
                                                to="/profile"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Trang cá nhân
                                            </ProfileMenuItem>
                                            
                                            <ProfileMenuItem 
                                                to="/profile/account"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Quản lý tài khoản
                                            </ProfileMenuItem>

                                            <ProfileMenuItem 
                                                to="/profile/movies"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                                </svg>
                                                Tủ phim
                                            </ProfileMenuItem>

                                            <ProfileMenuItem 
                                                to="/profile/payment"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                Nạp tiền
                                            </ProfileMenuItem>

                                            <ProfileMenuItem 
                                                to="/profile/bookings"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Lịch sử mua vé
                                            </ProfileMenuItem>

                                            <ProfileMenuItem 
                                                to="/profile/credits"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Moveek Credits
                                            </ProfileMenuItem>

                                            <div className="border-t border-gray-700 my-1"></div>
                                            
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-primary hover:text-white w-full text-left"
                                                role="menuitem"
                                            >
                                                <svg className="mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Đăng xuất
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center">
                                <Link
                                    to="/login"
                                    className="text-gray-300 hover:bg-primary hover:text-white px-3 py-2 rounded-md text-sm font-medium mr-2"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium"
                                >
                                    Register
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
                <div className="sm:hidden" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link
                            to="/"
                            className="text-gray-300 hover:bg-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Home
                        </Link>
                        <Link
                            to="/movies"
                            className="text-gray-300 hover:bg-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Movies
                        </Link>
                        <Link
                            to="/cinemas"
                            className="text-gray-300 hover:bg-primary hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                        >
                            Cinemas
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar; 