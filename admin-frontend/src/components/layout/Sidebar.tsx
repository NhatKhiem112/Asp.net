import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    Film,
    Users,
    Calendar,
    ShoppingBag,
    Layers,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'react-feather';

interface SidebarProps {
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed, setCollapsed }) => {
    const location = useLocation();

    const navItems = [
        { name: 'Dashboard', icon: Home, path: '/admin' },
        { name: 'Phim', icon: Film, path: '/admin/movies' },
        { name: 'Người dùng', icon: Users, path: '/admin/users' },
        { name: 'Lịch chiếu', icon: Calendar, path: '/admin/screenings' },
        { name: 'Đặt vé', icon: ShoppingBag, path: '/admin/bookings' },
        { name: 'Rạp phim', icon: Layers, path: '/admin/cinemas' },
        { name: 'Cài đặt', icon: Settings, path: '/admin/settings' },
    ];

    return (
        <div
            className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-40 transition-all duration-300 shadow-sm`}
            style={{ width: collapsed ? '80px' : '250px' }}
        >
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                {!collapsed && (
                    <h1 className="text-xl font-bold text-indigo-600">CineTicket</h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className={`${collapsed ? 'mx-auto' : 'ml-auto'} p-2 rounded-full hover:bg-gray-100`}
                >
                    {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav className="mt-4">
                <ul>
                    {navItems.map((item) => {
                        const isActive = location.pathname.startsWith(item.path);
                        const isDashboardActive = item.path === '/admin'
                            ? location.pathname === '/admin' || location.pathname === '/admin/'
                            : isActive;

                        return (
                            <li key={item.name} className="mb-1">
                                <Link
                                    to={item.path}
                                    className={`flex items-center py-3 px-4 ${collapsed ? 'justify-center' : ''
                                        } ${isDashboardActive
                                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                                            : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <item.icon size={20} className={isDashboardActive ? 'text-indigo-600' : 'text-gray-500'} />
                                    {!collapsed && <span className="ml-3">{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="absolute bottom-0 w-full border-t border-gray-200 p-4">
                <div className={`flex ${collapsed ? 'justify-center' : 'items-center'}`}>
                    {!collapsed && <span className="text-sm text-gray-500">Admin Portal v1.0</span>}
                    {collapsed && <Settings size={20} className="text-gray-500" />}
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 