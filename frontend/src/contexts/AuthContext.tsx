import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/auth.service';

interface User {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is already logged in
        const checkAuthStatus = async () => {
            try {
                setLoading(true);
                const userInfo = await AuthService.getCurrentUser();
                if (userInfo) {
                    setUser(userInfo);
                }
            } catch (error) {
                console.error('Failed to restore authentication state:', error);
                // Clear any invalid tokens
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            setLoading(true);
            const userData = await AuthService.login({ email, password });
            if (userData) {
                setUser(userData);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
        navigate('/login');
    };

    const value = {
        user,
        isAuthenticated: !!user,
        login,
        logout,
        loading
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 