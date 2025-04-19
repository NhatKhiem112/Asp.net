import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
    children: React.ReactNode;
    title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Dashboard' }) => {
    const [collapsed, setCollapsed] = useState(false);
    const sidebarWidth = collapsed ? '80px' : '250px';

    const toggleSidebar = () => {
        setCollapsed(!collapsed);
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <div
                className="flex flex-col flex-1 transition-all duration-300"
                style={{ marginLeft: sidebarWidth }}
            >
                <Header sidebarWidth={sidebarWidth} title={title} />

                <main
                    className="flex-1 p-6 transition-all duration-300"
                    style={{ marginTop: '64px' }}
                >
                    {children}
                </main>

                <footer className="py-4 text-center text-sm text-gray-500 border-t border-gray-200">
                    &copy; {new Date().getFullYear()} CineTicket. All Rights Reserved.
                </footer>
            </div>
        </div>
    );
};

export default Layout; 