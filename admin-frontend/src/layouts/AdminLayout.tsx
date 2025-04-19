import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import AuthService from '../services/auth.service';

interface AdminLayoutProps {
    children: ReactNode;
    title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Dashboard' }) => {
    const location = useLocation();
    const isAuthenticated = AuthService.isLoggedIn();
    const user = AuthService.getCurrentUser();

    // Kiểm tra xác thực
    if (!isAuthenticated) {
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Kiểm tra role là admin
    if (!user || user.role !== 'Admin') {
        AuthService.logout();
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }

    // Set document title
    document.title = `${title} | CineTicket Admin`;

    return (
        <Layout title={title}>
            {children}
        </Layout>
    );
};

export default AdminLayout; 