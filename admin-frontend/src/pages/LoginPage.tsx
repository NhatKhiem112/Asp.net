import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthService from '../services/auth.service';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/admin';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            setError('Vui lòng nhập email và mật khẩu');
            return;
        }

        setError('');
        setLoading(true);

        try {
            await AuthService.login({ email, password });

            // Nếu đăng nhập thành công, chuyển hướng về trang từ đầu
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error('Login error:', err);

            if (err.message?.includes('Only admin users')) {
                setError('Tài khoản của bạn không có quyền truy cập vào trang admin');
            } else if (err.response?.status === 401) {
                setError('Email hoặc mật khẩu không chính xác');
            } else {
                setError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-gray-800 p-10 rounded-lg shadow-lg">
                <div>
                    <div className="flex justify-center">
                        <img
                            className="h-20 w-auto"
                            src="/logo192.png"
                            alt="CineTicket Logo"
                        />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                        CineTicket Admin
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        Đăng nhập để quản lý hệ thống
                    </p>
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-500 text-white px-4 py-3 rounded-md">
                        {error}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email-address" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-t-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-600 placeholder-gray-500 text-white bg-gray-700 rounded-b-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 sm:text-sm"
                                placeholder="Mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : null}
                            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <a
                        href="/"
                        className="text-sm text-red-400 hover:text-red-300"
                    >
                        Quay về trang chủ
                    </a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 